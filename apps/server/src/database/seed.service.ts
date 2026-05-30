import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DatabaseService } from './database.service';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const count = await this.db.db.execute('SELECT COUNT(*) AS count FROM games');
    if (Number(count.rows[0].count) > 0) return;

    const root = join(process.cwd());
    const names = JSON.parse(
      readFileSync(join(root, 'GBA_Roms_Names.json'), 'utf8'),
    ).Name as string[];
    const genreFile = JSON.parse(
      readFileSync(join(root, 'GBA_Roms_Genres.json'), 'utf8'),
    ) as string | { Genre?: string[]; genres?: string[] };
    const genreRows = typeof genreFile === 'string' ? JSON.parse(genreFile) : genreFile;
    const allGenres = (genreRows.Genre ?? genreRows.genres ?? []) as string[];

    const publicUrl =
      this.config.get<string>('PUBLIC_API_URL') ?? 'http://localhost:3000';

    for (let i = 0; i < names.length; i++) {
      const rawGenre = allGenres[i] ?? 'Misc';
      const gameGenres = rawGenre.includes(', ')
        ? rawGenre.split(', ')
        : rawGenre.includes(',')
          ? rawGenre.split(',')
          : [rawGenre];

      await this.db.db.execute({
        sql: `INSERT INTO games (refid, name, path, priority_genre, genre, thumbnail, description)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          i,
          names[i],
          '',
          gameGenres[0],
          this.db.toJson(gameGenres),
          `${publicUrl}/Images/image${i}.jpg`,
          names[i],
        ],
      });
    }

    const uniqueGenres = new Set<string>();
    for (const raw of allGenres) {
      const parts = raw.includes(', ')
        ? raw.split(', ')
        : raw.includes(',')
          ? raw.split(',')
          : [raw];
      parts.forEach((g) => uniqueGenres.add(g));
    }

    for (const name of uniqueGenres) {
      await this.db.db.execute({
        sql: 'INSERT OR IGNORE INTO genres (name, related_genres) VALUES (?, ?)',
        args: [name, '[]'],
      });
    }
  }
}
