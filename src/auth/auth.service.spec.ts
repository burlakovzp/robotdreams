import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TokenEntity } from './token.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { PostEntity } from '../posts/post.entity';

describe('AuthService', () => {
  let service: AuthService;
  let tokenRepository: Repository<TokenEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(TokenEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PostEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    tokenRepository = module.get<Repository<TokenEntity>>(
      getRepositoryToken(TokenEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAccessToken', () => {
    it('should return a token entity', async () => {
      const token = 'access-token';
      const tokenEntity = new TokenEntity();
      jest.spyOn(tokenRepository, 'findOne').mockResolvedValue(tokenEntity);

      const result = await service.findAccessToken(token);
      expect(result).toEqual(tokenEntity);
      expect(tokenRepository.findOne).toHaveBeenCalledWith({
        where: { access_token: token },
      });
    });
  });

  describe('findRefreshToken', () => {
    it('should return a token entity', async () => {
      const token = 'refresh-token';
      const tokenEntity = new TokenEntity();
      jest.spyOn(tokenRepository, 'findOne').mockResolvedValue(tokenEntity);

      const result = await service.findRefreshToken(token);
      expect(result).toEqual(tokenEntity);
      expect(tokenRepository.findOne).toHaveBeenCalledWith({
        where: { refresh_token: token },
      });
    });
  });

  describe('saveTokens', () => {
    it('should save and return a token entity', async () => {
      const userId = 1;
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';
      const tokenEntity = new TokenEntity();
      jest.spyOn(tokenRepository, 'save').mockResolvedValue(tokenEntity);

      const result = await service.saveTokens(
        userId,
        accessToken,
        refreshToken,
      );
      expect(result).toEqual(tokenEntity);
      expect(tokenRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      );
    });
  });
});
