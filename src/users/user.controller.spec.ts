import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const user: UserEntity = {
      id: 1,
      email: 'john@example.com',
      password: 'password123',
      hashPassword: jest.fn(),
      comparePassword: jest.fn(),
      posts: [],
      tokens: [],
    };
    jest.spyOn(userService, 'create').mockResolvedValue(user);

    expect(await controller.create(user)).toBe(user);
    expect(userService.create).toHaveBeenCalledWith(user);
  });
});
