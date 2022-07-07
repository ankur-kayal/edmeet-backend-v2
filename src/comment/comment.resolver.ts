import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';

@Resolver(() => Comment)
@UseGuards(JwtAuthGuard)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @Mutation(() => Comment)
  async createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
    @Context() context,
  ): Promise<Comment> {
    const userId = context.req.user.userId;
    return await this.commentService.create(createCommentInput, userId);
  }

  @Query(() => [Comment], { name: 'comments' })
  async findAll(
    @Args('roomId') roomId: string,
    @Args('feedId') feedId: string,
    @Context() context,
  ): Promise<Comment[]> {
    const userId = context.req.user.userId;
    return await this.commentService.findAll(roomId, feedId, userId);
  }

  @Query(() => Comment, { name: 'comment' })
  async findOne(@Args('id') id: string, @Context() context): Promise<Comment> {
    const userId = context.req.user.userId;
    return await this.commentService.findOne(id, userId);
  }

  @Mutation(() => Comment)
  async updateComment(
    @Args('id') id: string,
    @Args('updateCommentInput') updateCommentInput: UpdateCommentInput,
    @Context() context,
  ): Promise<Comment> {
    const userId = context.req.user.userId;
    return await this.commentService.update(id, updateCommentInput, userId);
  }

  @Mutation(() => String)
  async removeComment(
    @Args('id') id: string,
    @Context() context,
  ): Promise<string> {
    const userId = context.req.user.userId;
    return await this.commentService.remove(id, userId);
  }
}
