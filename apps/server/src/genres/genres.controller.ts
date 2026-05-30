import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { GenresService } from './genres.service';

@Controller('genre')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get('list/all')
  getAllGenres() {
    return this.genresService.findAll();
  }

  @Get('get/:genreId')
  getGenre(@Param('genreId') genreId: string) {
    return this.genresService.findById(genreId);
  }

  @Post('create')
  createGenre(@Body() body: { name: string; genres?: string[] }) {
    return this.genresService.create({
      name: body.name,
      related_genres: body.genres,
    });
  }

  @Put('edit/:genreId')
  editGenre(
    @Param('genreId') genreId: string,
    @Body() body: { name?: string; related_genres?: string[] },
  ) {
    return this.genresService.updateById(genreId, body);
  }

  @Delete('delete/:genreId')
  deleteGenre(@Param('genreId') genreId: string) {
    return this.genresService.deleteById(genreId);
  }
}
