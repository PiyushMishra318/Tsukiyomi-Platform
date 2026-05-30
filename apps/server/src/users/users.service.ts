import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly auth: AuthService,
  ) {}

  async findAll() {
    const result = await this.db.db.execute('SELECT * FROM users');
    return result.rows.map((row) => this.auth.toResponse(this.rowToUser(row)));
  }

  async findByPhone(phone: number) {
    return this.auth.findByPhone(phone);
  }

  async create(data: { phone: number; password?: string; username?: string }) {
    const existing = await this.auth.findByPhone(data.phone);
    if (existing) {
      return this.auth.toResponse(existing);
    }
    if (data.password) {
      const result = await this.auth.register(
        data.phone,
        data.password,
        data.username,
      );
      return result.user;
    }
    const passwordHash = await import('bcryptjs').then((b) =>
      b.hash(`temp-${data.phone}`, 10),
    );
    await this.db.db.execute({
      sql: `INSERT INTO users (phone, username, password_hash)
            VALUES (?, ?, ?)`,
      args: [data.phone, data.username ?? `user_${data.phone}`, passwordHash],
    });
    const user = await this.auth.findByPhone(data.phone);
    return this.auth.toResponse(user!);
  }

  async updateByPhone(phone: number, update: Record<string, unknown>) {
    const user = await this.auth.findByPhone(phone);
    if (!user) return null;

    const genres = (update.genres as string[] | undefined) ?? user.genres;
    const favorites =
      (update.favorites as Record<string, unknown>[] | undefined) ??
      user.favorites;
    const userHistory =
      (update.user_history as Record<string, unknown>[] | undefined) ??
      user.user_history;
    const username = (update.username as string | undefined) ?? user.username;

    await this.db.db.execute({
      sql: `UPDATE users SET username = ?, genres = ?, favorites = ?, user_history = ?
            WHERE phone = ?`,
      args: [
        username ?? null,
        this.db.toJson(genres),
        this.db.toJson(favorites),
        this.db.toJson(userHistory),
        phone,
      ],
    });

    const updated = await this.auth.findByPhone(phone);
    return updated ? this.auth.toResponse(updated) : null;
  }

  async deleteByPhone(phone: number) {
    await this.db.db.execute({
      sql: 'DELETE FROM users WHERE phone = ?',
      args: [phone],
    });
    return { deleted: true };
  }

  async checkFavorite(phone: number, romId: string) {
    const user = await this.auth.findByPhone(phone);
    if (!user) return false;
    return user.favorites.some((f) => String(f._id) === romId);
  }

  async pullFavorite(phone: number, favoriteId: string, genre: string) {
    const user = await this.auth.findByPhone(phone);
    if (!user) return null;

    const favorites = user.favorites.filter(
      (f) => String(f._id) !== favoriteId,
    );
    const genres = user.genres.filter((g) => g !== genre);

    await this.db.db.execute({
      sql: 'UPDATE users SET favorites = ?, genres = ? WHERE phone = ?',
      args: [this.db.toJson(favorites), this.db.toJson(genres), phone],
    });

    const updated = await this.auth.findByPhone(phone);
    return updated ? this.auth.toResponse(updated) : null;
  }

  private rowToUser(row: Record<string, unknown>) {
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
}
