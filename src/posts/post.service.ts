import { Injectable } from '@nestjs/common';
import { PostEntity } from './post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postsRepository: Repository<PostEntity>,
  ) {}

  async getPosts(): Promise<PostEntity[]> {
    return this.postsRepository.find();
  }

  async getUserPosts(userId: string): Promise<PostEntity[]> {
    const foundPosts = this.postsRepository.find({
      where: { user: { id: parseInt(userId) } },
    });

    if (!foundPosts) {
      return [];
    }

    return foundPosts;
  }

  async createPost(data: PostEntity): Promise<PostEntity> {
    return this.postsRepository.save(data);
  }
}
