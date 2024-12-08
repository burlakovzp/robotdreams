import { Body, Controller, Post } from '@nestjs/common';
import { UserEntity } from '../users/user.entity';
import { AuthService } from './auth.service';
import { TokenEntity } from './token.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() data: UserEntity): Promise<TokenEntity> {
    return this.authService.login(data);
  }

  @Post('refresh')
  async refresh(@Body() data: TokenEntity): Promise<TokenEntity> {
    return this.authService.refresh(data);
  }
}
