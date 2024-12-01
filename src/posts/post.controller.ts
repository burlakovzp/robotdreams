import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PostService } from './post.service';
import { PostEntity } from './post.entity';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('')
  async getPosts(): Promise<PostEntity[]> {
    return this.postService.getPosts();
  }

  @Get(':id')
  async getPost(@Param('id') id: string): Promise<PostEntity[]> {
    return this.postService.getUserPosts(id);
  }

  @Post('')
  async createPost(@Body() body: PostEntity): Promise<PostEntity> {
    return this.postService.createPost(body);
  }
}
