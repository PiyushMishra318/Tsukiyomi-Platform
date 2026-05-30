import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';

export interface AuthUser {
  id: number;
  phone: number;
  username?: string;
  genres: string[];
  favorites: Record<string, unknown>[];
  user_history: Record<string, unknown>[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(phone: number, password: string, username?: string) {
    const existing = await this.db.db.execute({
      sql: 'SELECT id FROM users WHERE phone = ?',
      args: [phone],
    });
    if (existing.rows.length > 0) {
      throw new UnauthorizedException('Phone already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await this.db.db.execute({
      sql: `INSERT INTO users (phone, username, password_hash)
            VALUES (?, ?, ?)`,
      args: [phone, username ?? `user_${phone}`, passwordHash],
    });

    const user = await this.findByPhone(phone);
    const accessToken = await this.signToken(user!);
    return { accessToken, user: this.toResponse(user!) };
  }

  async login(phone: number, password: string) {
    const user = await this.findByPhone(phone);
    if (!user) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    const row = await this.db.db.execute({
      sql: 'SELECT password_hash FROM users WHERE phone = ?',
      args: [phone],
    });
    const hash = row.rows[0]?.password_hash as string;
    const valid = await bcrypt.compare(password, hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    const accessToken = await this.signToken(user);
    return { accessToken, user: this.toResponse(user) };
  }

  async signToken(user: AuthUser) {
    return this.jwt.signAsync(
      { sub: user.id, phone: user.phone },
      {
        secret: this.config.get<string>('JWT_SECRET') ?? 'dev-secret',
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '7d',
      },
    );
  }

  async findByPhone(phone: number): Promise<AuthUser | null> {
    const result = await this.db.db.execute({
      sql: 'SELECT * FROM users WHERE phone = ?',
      args: [phone],
    });
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: Number(row.id),
      phone: Number(row.phone),
      username: row.username as string | undefined,
      genres: this.db.parseJson<string[]>(row.genres as string, []),
      favorites: this.db.parseJson<Record<string, unknown>[]>(
        row.favorites as string,
        [],
      ),
      user_history: this.db.parseJson<Record<string, unknown>[]>(
        row.user_history as string,
        [],
      ),
    };
  }

  toResponse(user: AuthUser) {
    return {
      _id: String(user.id),
      phone: user.phone,
      username: user.username,
      genres: user.genres,
      favorites: user.favorites,
      user_history: user.user_history,
    };
  }
}
