import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { GamesModule } from '../games/games.module';
import { GenresModule } from '../genres/genres.module';

@Module({
  imports: [GamesModule, GenresModule],
  controllers: [AdminController],
})
export class AdminModule {}
