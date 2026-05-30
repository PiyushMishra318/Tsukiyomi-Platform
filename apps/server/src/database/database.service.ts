import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, Client } from '@libsql/client';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

@Injectable()
export class DatabaseService implements OnModuleInit {
  private client!: Client;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const tursoUrl = this.config.get<string>('TURSO_DATABASE_URL');
    const databaseUrl = this.config.get<string>('DATABASE_URL');
    const onVercel = process.env.VERCEL === '1';

    let url: string;
    if (tursoUrl) {
      url = tursoUrl;
    } else if (databaseUrl) {
      url = databaseUrl;
    } else if (onVercel) {
      // Ephemeral demo fallback when Turso is not configured on Vercel.
      url = ':memory:';
    } else {
      url = 'file:./data/tsukiyomi.db';
    }

    if (url.startsWith('file:')) {
      const filePath = url.replace(/^file:/, '');
      mkdirSync(dirname(filePath), { recursive: true });
    }

    this.client = createClient({
      url,
      authToken: this.config.get<string>('TURSO_AUTH_TOKEN'),
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
