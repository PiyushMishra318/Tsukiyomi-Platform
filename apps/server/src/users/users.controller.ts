import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { GamesService } from '../games/games.service';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly gamesService: GamesService,
    private readonly authService: AuthService,
  ) {}

  @Get('list/all')
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Get('get/:userId')
  async getUser(@Param('userId') userId: string) {
    const user = await this.usersService.findByPhone(Number(userId));
    if (!user) return null;
    return this.authService.toResponse(user);
  }

  @Post('create')
  async createUser(@Body() body: Record<string, unknown>) {
    const phone = Number(body.phone);
    const existing = await this.usersService.findByPhone(phone);
    if (existing) {
      return this.authService.toResponse(existing);
    }
    return this.usersService.create(body as never);
  }

  @Put('edit/:userId')
  async editUser(
    @Param('userId') userId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const phone = Number(userId);
    if (body.update === 'favorite' && body.favorite) {
      const favorite = body.favorite as Record<string, unknown>;
      const genre = favorite.priority_genre as string;
      const pulled = await this.usersService.pullFavorite(
        phone,
        String(favorite._id),
        genre,
      );
      if (pulled) {
        return { user: pulled, liked: false };
      }
      const user = await this.usersService.findByPhone(phone);
      if (!user) return null;
      const favorites = [...user.favorites, favorite];
      const genres = user.genres.includes(genre)
        ? user.genres
        : [...user.genres, genre];
      const updated = await this.usersService.updateByPhone(phone, {
        favorites,
        genres,
      });
      return { user: updated, liked: true };
    }
    return this.usersService.updateByPhone(phone, body);
  }

  @Get('favorite/:userId/:romId')
  checkFavorite(
    @Param('userId') userId: string,
    @Param('romId') romId: string,
  ) {
    return this.usersService.checkFavorite(Number(userId), romId);
  }

  @Get('recommended/:userId')
  async getRecommended(@Param('userId') userId: string) {
    const user = await this.usersService.findByPhone(Number(userId));
    if (!user || user.genres.length === 0) {
      return this.gamesService.findAll().then((games) => games.slice(0, 10));
    }
    const random = Math.floor(Math.random() * 100);
    return this.gamesService.findByGenres(user.genres, random, 10);
  }

  @Delete('delete/:userId')
  deleteUser(@Param('userId') userId: string) {
    return this.usersService.deleteByPhone(Number(userId));
  }
}
