import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<UserEntity> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<UserEntity | undefined> {
    return this.usersRepository.findOneBy({ email });
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.findByEmail(email);
    if (user && (await user.comparePassword(password))) {
      return user;
    }
    return null;
  }
}
