import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PostEntity } from './post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import RedisService from '../shared/services/redis.service';
import { TokenEntity } from '../auth/token.entity';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postsRepository: Repository<PostEntity>,
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
  ) {}

  async getPosts(): Promise<PostEntity[]> {
    return this.postsRepository.find();
  }

  async getUserPosts(
    userToken: TokenEntity['access_token'],
  ): Promise<PostEntity[]> {
    const foundToken = await this.authService.findAccessToken(
      userToken.split(' ')[1],
    );

    if (!foundToken) {
      throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
    }

    const userId = foundToken.user_id;
    const redisKey = `posts:${userId}`;
    const cachedPosts = await this.redisService.get(redisKey);

    if (cachedPosts) {
      return JSON.parse(cachedPosts);
    }

    const foundPosts = await this.postsRepository.find({
      where: { user: { id: userId } },
    });

    if (!foundPosts) {
      return [];
    }

    this.redisService.set(redisKey, JSON.stringify(foundPosts));

    return foundPosts;
  }

  async createPost(
    data: PostEntity,
    userToken: TokenEntity['access_token'],
  ): Promise<PostEntity> {
    const foundToken = await this.authService.findAccessToken(
      userToken.split(' ')[1],
    );

    if (!foundToken) {
      throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
    }

    return this.postsRepository.save({
      ...data,
      user_id: foundToken.user_id,
    });
  }
}
