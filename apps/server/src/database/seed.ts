import { createClient } from '@libsql/client';
import { readFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

async function seed() {
  const url = process.env.DATABASE_URL ?? 'file:./data/tsukiyomi.db';
  if (url.startsWith('file:')) {
    mkdirSync(dirname(url.replace(/^file:/, '')), { recursive: true });
  }

  const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  const publicUrl = process.env.PUBLIC_API_URL ?? 'http://localhost:3000';
  const root = join(__dirname, '../..');

  const names = JSON.parse(
    readFileSync(join(root, 'GBA_Roms_Names.json'), 'utf8'),
  ).Name as string[];

  const genreFile = JSON.parse(
    readFileSync(join(root, 'GBA_Roms_Genres.json'), 'utf8'),
  ) as string | { Genre?: string[]; genres?: string[] };
  const genreRows = typeof genreFile === 'string' ? JSON.parse(genreFile) : genreFile;
  const allGenres = (genreRows.Genre ?? genreRows.genres ?? []) as string[];

  const existing = await db.execute('SELECT COUNT(*) AS count FROM games');
  if (Number(existing.rows[0].count) > 0) {
    console.log('Database already seeded.');
    return;
  }

  for (let i = 0; i < names.length; i++) {
    const rawGenre = allGenres[i] ?? 'Misc';
    const gameGenres = rawGenre.includes(', ')
      ? rawGenre.split(', ')
      : rawGenre.includes(',')
        ? rawGenre.split(',')
        : [rawGenre];

    await db.execute({
      sql: `INSERT INTO games (refid, name, path, priority_genre, genre, thumbnail, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        i,
        names[i],
        '',
        gameGenres[0],
        JSON.stringify(gameGenres),
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
    await db.execute({
      sql: 'INSERT OR IGNORE INTO genres (name, related_genres) VALUES (?, ?)',
      args: [name, '[]'],
    });
  }

  console.log(`Seeded ${names.length} games and ${uniqueGenres.size} genres.`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
