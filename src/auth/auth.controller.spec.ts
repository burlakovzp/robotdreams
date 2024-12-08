import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TokenEntity } from './token.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { UserEntity } from '../users/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        UserService,
        {
          provide: getRepositoryToken(TokenEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a token entity', async () => {
      const user: UserEntity = {
        id: 1,
        password: 'test',
        email: 'test@example.com',
        hashPassword: jest.fn(),
        comparePassword: jest.fn(),
        posts: [],
        tokens: [],
      };
      const token: TokenEntity = {
        id: 1,
        user_id: 1,
        access_token: 'testToken',
        refresh_token: 'testRefreshToken',
        created_at: new Date(),
        user: user,
      };

      jest.spyOn(authService, 'login').mockResolvedValue(token);

      expect(await controller.login(user)).toBe(token);
    });
  });
});
