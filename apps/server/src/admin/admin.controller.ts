import { Body, Controller, Post } from '@nestjs/common';
import { GamesService } from '../games/games.service';
import { GenresService } from '../genres/genres.service';

function parseGenres(genres: string[]): string[][] {
  return genres.map((gn) => {
    if (gn.includes(', ')) return gn.split(', ');
    if (gn.includes(',')) return gn.split(',');
    return [gn];
  });
}

@Controller()
export class AdminController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly genresService: GenresService,
  ) {}

  @Post('update/games')
  async updateGames(@Body() body: { genres: string[] }) {
    const genres = parseGenres(body.genres);
    const games = [];
    for (let i = 0; i < genres.length; i++) {
      games.push(
        await this.gamesService.updateByRefId(i, {
          priority_genre: genres[i][0],
          genre: genres[i],
        }),
      );
    }
    return games;
  }

  @Post('populate')
  async populate(@Body() body: { games: string[]; baseUrl?: string }) {
    const baseUrl = body.baseUrl ?? process.env.PUBLIC_API_URL ?? 'http://localhost:3000';
    const data = body.games.map((name, i) => ({
      refid: i,
      name,
      thumbnail: `${baseUrl}/Images/image${i}.jpg`,
    }));
    return this.gamesService.insertMany(data);
  }

  @Post('genrepopulate')
  async genrePopulate(@Body() body: { genres: string[] }) {
    const expanded: string[] = [];
    for (const genre of body.genres) {
      if (genre.includes(', ')) expanded.push(...genre.split(', '));
      else if (genre.includes(',')) expanded.push(...genre.split(','));
      else expanded.push(genre);
    }
    const unique = Array.from(new Set(expanded));
    return this.genresService.insertMany(unique.map((name) => ({ name })));
  }
}
