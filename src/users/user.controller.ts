import { Body, Controller, Post } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post('create')
  async create(@Body() user: UserEntity): Promise<UserEntity> {
    return this.usersService.create(user);
  }
}
