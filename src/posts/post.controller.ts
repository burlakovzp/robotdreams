import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { PostEntity } from './post.entity';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@ApiTags('posts')
@UseGuards(AuthGuard)
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiBearerAuth()
  @Get('all')
  @ApiResponse({
    status: 200,
    description: 'Return all posts',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getPosts(): Promise<PostEntity[]> {
    return this.postService.getPosts();
  }

  @Get('')
  @ApiResponse({
    status: 200,
    description: 'Return posts by user id',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getPost(
    @Headers('Authorization') userToken: string,
  ): Promise<PostEntity[]> {
    return this.postService.getUserPosts(userToken);
  }

  @Post('create')
  @ApiResponse({
    status: 201,
    description: 'Create post',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createPost(
    @Body() body: PostEntity,
    @Headers('Authorization') userToken: string,
  ): Promise<PostEntity> {
    return this.postService.createPost(body, userToken);
  }
}
