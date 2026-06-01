import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, Client } from '@libsql/client';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

@Injectable()
export class DatabaseService implements OnModuleInit {
  private client!: Client;
  private dbMode: 'turso' | 'memory' | 'file' = 'file';

  constructor(private readonly config: ConfigService) {}

  getMode(): string {
    return this.dbMode;
  }

  async onModuleInit() {
    const tursoUrl = this.config.get<string>('TURSO_DATABASE_URL');
    const databaseUrl = this.config.get<string>('DATABASE_URL');
    const onVercel =
      process.env.VERCEL === '1' ||
      process.env.VERCEL === 'true' ||
      Boolean(process.env.VERCEL_ENV);

    let url: string;
    if (tursoUrl) {
      url = tursoUrl;
      this.dbMode = 'turso';
    } else if (onVercel) {
      // Vercel has a read-only filesystem; never use local SQLite files here.
      url = ':memory:';
      this.dbMode = 'memory';
    } else if (databaseUrl) {
      url = databaseUrl;
      this.dbMode = url.includes(':memory:') ? 'memory' : 'file';
    } else {
      url = 'file:./data/tsukiyomi.db';
      this.dbMode = 'file';
    }

    if (
      !onVercel &&
      url.startsWith('file:') &&
      !url.includes(':memory:')
    ) {
      const filePath = url.replace(/^file:/, '');
      mkdirSync(dirname(filePath), { recursive: true });
    }

    this.client = createClient({
      url,
      authToken: tursoUrl ? this.config.get<string>('TURSO_AUTH_TOKEN') : undefined,
    });

    await this.migrate();
  }

  get db(): Client {
    return this.client;
  }

  private async migrate() {
    await this.client.batch([
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone INTEGER NOT NULL UNIQUE,
        username TEXT,
        password_hash TEXT NOT NULL,
        genres TEXT NOT NULL DEFAULT '[]',
        favorites TEXT NOT NULL DEFAULT '[]',
        user_history TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        refid INTEGER NOT NULL UNIQUE,
        name TEXT NOT NULL,
        path TEXT,
        played_by TEXT NOT NULL DEFAULT '[]',
        priority_genre TEXT,
        genre TEXT NOT NULL DEFAULT '[]',
        thumbnail TEXT,
        description TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS genres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        related_genres TEXT NOT NULL DEFAULT '[]'
      )`,
    ]);
  }

  parseJson<T>(value: string | null | undefined, fallback: T): T {
    if (!value) return fallback;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  toJson(value: unknown): string {
    return JSON.stringify(value ?? null);
  }
}
