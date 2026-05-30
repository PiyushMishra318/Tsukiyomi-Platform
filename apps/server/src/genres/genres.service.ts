import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class GenresService {
  constructor(private readonly db: DatabaseService) {}

  private mapRow(row: Record<string, unknown>) {
    return {
      _id: String(row.id),
      name: row.name as string,
      related_genres: this.db.parseJson<string[]>(
        row.related_genres as string,
        [],
      ),
    };
  }

  async findAll() {
    const result = await this.db.db.execute('SELECT * FROM genres ORDER BY name');
    return result.rows.map((row) => this.mapRow(row));
  }

  async findById(id: string) {
    const result = await this.db.db.execute({
      sql: 'SELECT * FROM genres WHERE id = ?',
      args: [Number(id)],
    });
    if (result.rows.length === 0) return null;
    return this.mapRow(result.rows[0]);
  }

  async create(data: { name: string; related_genres?: string[] }) {
    await this.db.db.execute({
      sql: 'INSERT OR IGNORE INTO genres (name, related_genres) VALUES (?, ?)',
      args: [data.name, this.db.toJson(data.related_genres ?? [])],
    });
    const result = await this.db.db.execute({
      sql: 'SELECT * FROM genres WHERE name = ?',
      args: [data.name],
    });
    return this.mapRow(result.rows[0]);
  }

  async updateById(id: string, data: { name?: string; related_genres?: string[] }) {
    const genre = await this.findById(id);
    if (!genre) return null;
    await this.db.db.execute({
      sql: 'UPDATE genres SET name = ?, related_genres = ? WHERE id = ?',
      args: [
        data.name ?? genre.name,
        this.db.toJson(data.related_genres ?? genre.related_genres),
        Number(id),
      ],
    });
    return this.findById(id);
  }

  async deleteById(id: string) {
    await this.db.db.execute({
      sql: 'DELETE FROM genres WHERE id = ?',
      args: [Number(id)],
    });
    return { deleted: true };
  }

  async insertMany(data: Array<{ name: string }>) {
    const created = [];
    for (const item of data) {
      created.push(await this.create(item));
    }
    return created;
  }
}
