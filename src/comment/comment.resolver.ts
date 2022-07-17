import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  Info,
} from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { parse } from 'graphql-parse-resolve-info';

@Resolver(() => Comment)
@UseGuards(JwtAuthGuard)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @Mutation(() => Comment)
  async createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
    @Context() context,
    @Info() info,
  ): Promise<Comment> {
    const parsedInfo = parse(info);
    const fields = Object.keys(parsedInfo.fieldsByTypeName.Comment);
    const include = {
      feed: fields.indexOf('feed') !== -1,
      user: fields.indexOf('user') !== -1,
    };
    const userId = context.req.user.userId;
    return await this.commentService.create(
      createCommentInput,
      userId,
      include,
    );
  }

  @Query(() => [Comment], { name: 'comments' })
  async findAll(
    @Args('roomId') roomId: string,
    @Args('feedId') feedId: string,
    @Context() context,
    @Info() info,
  ): Promise<Comment[]> {
    const parsedInfo = parse(info);
    const fields = Object.keys(parsedInfo.fieldsByTypeName.Comment);
    const include = {
      feed: fields.indexOf('feed') !== -1,
      user: fields.indexOf('user') !== -1,
    };
    const userId = context.req.user.userId;
    return await this.commentService.findAll(roomId, feedId, userId, include);
  }

  @Query(() => Comment, { name: 'comment' })
  async findOne(
    @Args('id') id: string,
    @Context() context,
    @Info() info,
  ): Promise<Comment> {
    const parsedInfo = parse(info);
    const fields = Object.keys(parsedInfo.fieldsByTypeName.Comment);
    const include = {
      feed: fields.indexOf('feed') !== -1,
      user: fields.indexOf('user') !== -1,
    };
    const userId = context.req.user.userId;
    return await this.commentService.findOne(id, userId, include);
  }

  @Mutation(() => Comment)
  async updateComment(
    @Args('id') id: string,
    @Args('updateCommentInput') updateCommentInput: UpdateCommentInput,
    @Context() context,
    @Info() info,
  ): Promise<Comment> {
    const parsedInfo = parse(info);
    const fields = Object.keys(parsedInfo.fieldsByTypeName.Comment);
    const include = {
      feed: fields.indexOf('feed') !== -1,
      user: fields.indexOf('user') !== -1,
    };
    const userId = context.req.user.userId;
    return await this.commentService.update(
      id,
      updateCommentInput,
      userId,
      include,
    );
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
