import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('game')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('list/all')
  getAllGames() {
    return this.gamesService.findAll();
  }

  @Get('get/:gameId')
  getGame(@Param('gameId') gameId: string) {
    return this.gamesService.findByRefId(Number(gameId));
  }

  @Post('create')
  createGame(@Body() body: Record<string, unknown>) {
    return this.gamesService.create({
      name: body.name as string,
      path: body.path as string,
      played_by: body.played as never,
      priority_genre: body.priority_genre as string,
      genre: body.genre as string[],
      thumbnail: body.thumbnail as string,
      description: body.description as string,
    });
  }

  @Put('edit/:gameId')
  editGame(@Param('gameId') gameId: string, @Body() body: Record<string, unknown>) {
    return this.gamesService.updateByRefId(Number(gameId), body);
  }

  @Delete('delete/:gameId')
  deleteGame(@Param('gameId') gameId: string) {
    return this.gamesService.deleteByRefId(Number(gameId));
  }
}
