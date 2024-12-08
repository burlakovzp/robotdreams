import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from './token.entity';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { UserModule } from '../users/user.module';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
    }),
    UserModule,
  ],
  providers: [AuthService, JwtService, UserService, AuthGuard],
  controllers: [AuthController],
  exports: [TypeOrmModule, AuthGuard, AuthService],
})
export class AuthModule {}
