import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { PostEntity } from './post.entity';
import RedisService from '../shared/services/redis.service';
import { AuthService } from '../auth/auth.service';
import { TokenEntity } from '../auth/token.entity';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { HttpException } from '@nestjs/common';

describe('PostService', () => {
  let service: PostService;
  let postsRepository: Repository<PostEntity>;
  let redisService: RedisService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(PostEntity),
          useClass: Repository,
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            findAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    postsRepository = module.get<Repository<PostEntity>>(
      getRepositoryToken(PostEntity),
    );
    redisService = module.get<RedisService>(RedisService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPosts', () => {
    it('should return an array of posts', async () => {
      const posts = [new PostEntity(), new PostEntity()];
      jest.spyOn(postsRepository, 'find').mockResolvedValue(posts);

      expect(await service.getPosts()).toBe(posts);
    });
  });

  describe('getUserPosts', () => {
    it('should return cached posts if available', async () => {
      const userToken = 'Bearer token';
      const cachedPosts = JSON.stringify([new PostEntity(), new PostEntity()]);
      jest
        .spyOn(authService, 'findAccessToken')
        .mockResolvedValue({ user_id: 1 } as TokenEntity);
      jest.spyOn(redisService, 'get').mockResolvedValue(cachedPosts);

      const result = await service.getUserPosts(userToken);

      expect(result).toEqual(JSON.parse(cachedPosts));
    });

    it('should return posts from repository if not cached', async () => {
      const userToken = 'Bearer token';
      const posts = [new PostEntity(), new PostEntity()];
      jest
        .spyOn(authService, 'findAccessToken')
        .mockResolvedValue({ user_id: 1 } as TokenEntity);
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      jest.spyOn(postsRepository, 'find').mockResolvedValue(posts);
      jest.spyOn(redisService, 'set').mockImplementation();

      const result = await service.getUserPosts(userToken);

      expect(result).toEqual(posts);
      expect(redisService.set).toHaveBeenCalledWith(
        'posts:1',
        JSON.stringify(posts),
      );
    });

    it('should throw an exception if token is invalid', async () => {
      const userToken = 'Bearer invalid_token';
      jest.spyOn(authService, 'findAccessToken').mockResolvedValue(null);

      await expect(service.getUserPosts(userToken)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('createPost', () => {
    it('should create and return a post', async () => {
      const userToken = 'Bearer token';
      const post = new PostEntity();
      jest
        .spyOn(authService, 'findAccessToken')
        .mockResolvedValue({ user_id: 1 } as TokenEntity);
      jest.spyOn(postsRepository, 'save').mockResolvedValue(post);

      const result = await service.createPost(post, userToken);

      expect(result).toBe(post);
      expect(postsRepository.save).toHaveBeenCalledWith({
        ...post,
        user_id: 1,
      });
    });

    it('should throw an exception if token is invalid', async () => {
      const userToken = 'Bearer invalid_token';
      const post = new PostEntity();
      jest.spyOn(authService, 'findAccessToken').mockResolvedValue(null);

      await expect(service.createPost(post, userToken)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
