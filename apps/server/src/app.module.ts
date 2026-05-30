import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { GamesModule } from './games/games.module';
import { GenresModule } from './genres/genres.module';
import { SeedService } from './database/seed.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    GamesModule,
    GenresModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [SeedService],
})
export class AppModule {}
