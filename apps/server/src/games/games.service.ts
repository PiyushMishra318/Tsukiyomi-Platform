import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class GamesService {
  constructor(private readonly db: DatabaseService) {}

  private mapRow(row: Record<string, unknown>) {
    return {
      _id: String(row.id),
      refid: Number(row.refid),
      name: row.name as string,
      path: row.path as string,
      played_by: this.db.parseJson<unknown[]>(row.played_by as string, []),
      priority_genre: row.priority_genre as string,
      genre: this.db.parseJson<string[]>(row.genre as string, []),
      thumbnail: row.thumbnail as string,
      description: row.description as string,
    };
  }

  async findAll() {
    const result = await this.db.db.execute('SELECT * FROM games ORDER BY refid');
    return result.rows.map((row) => this.mapRow(row));
  }

  async findByRefId(refid: number) {
    const result = await this.db.db.execute({
      sql: 'SELECT * FROM games WHERE refid = ?',
      args: [refid],
    });
    if (result.rows.length === 0) return null;
    return this.mapRow(result.rows[0]);
  }

  async findByGenres(genres: string[], skip: number, limit: number) {
    const all = await this.findAll();
    const filtered = all.filter((game) =>
      game.genre.some((g) => genres.includes(g)),
    );
    return filtered.slice(skip, skip + limit);
  }

  async create(data: {
    name: string;
    path?: string;
    played_by?: unknown[];
    priority_genre?: string;
    genre?: string[];
    thumbnail?: string;
    description?: string;
    refid?: number;
  }) {
    const max = await this.db.db.execute('SELECT MAX(refid) AS maxRef FROM games');
    const refid = data.refid ?? Number(max.rows[0].maxRef ?? -1) + 1;
    const result = await this.db.db.execute({
      sql: `INSERT INTO games (refid, name, path, played_by, priority_genre, genre, thumbnail, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        refid,
        data.name,
        data.path ?? '',
        this.db.toJson(data.played_by ?? []),
        data.priority_genre ?? '',
        this.db.toJson(data.genre ?? []),
        data.thumbnail ?? '',
        data.description ?? data.name,
      ],
    });
    return this.findByRefId(refid);
  }

  async updateByRefId(refid: number, data: Record<string, unknown>) {
    const game = await this.findByRefId(refid);
    if (!game) return null;
    await this.db.db.execute({
      sql: `UPDATE games SET name = ?, path = ?, priority_genre = ?, genre = ?, thumbnail = ?, description = ?
            WHERE refid = ?`,
      args: [
        (data.name as string) ?? game.name,
        (data.path as string) ?? game.path,
        (data.priority_genre as string) ?? game.priority_genre,
        this.db.toJson((data.genre as string[]) ?? game.genre),
        (data.thumbnail as string) ?? game.thumbnail,
        (data.description as string) ?? game.description,
        refid,
      ],
    });
    return this.findByRefId(refid);
  }

  async deleteByRefId(refid: number) {
    await this.db.db.execute({
      sql: 'DELETE FROM games WHERE refid = ?',
      args: [refid],
    });
    return { deleted: true };
  }

  async insertMany(data: Array<Partial<ReturnType<typeof this.mapRow>>>) {
    const created = [];
    for (const item of data) {
      created.push(await this.create(item as never));
    }
    return created;
  }
}
