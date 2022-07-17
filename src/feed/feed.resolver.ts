import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  Info,
} from '@nestjs/graphql';
import { FeedService } from './feed.service';
import { Feed } from './entities/feed.entity';
import { CreateFeedInput } from './dto/create-feed.input';
import { UpdateFeedInput } from './dto/update-feed.input';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { parse } from 'graphql-parse-resolve-info';

@Resolver(() => Feed)
@UseGuards(JwtAuthGuard)
export class FeedResolver {
  constructor(private readonly feedService: FeedService) {}

  @Mutation(() => Feed)
  async createFeed(
    @Args('createFeedInput') createFeedInput: CreateFeedInput,
    @Context() context,
    @Info() info,
  ): Promise<Feed> {
    const parsedInfo = parse(info);
    const fields = Object.keys(parsedInfo.fieldsByTypeName.Feed);
    const include = {
      comments: fields.indexOf('comments') !== -1,
      user: fields.indexOf('user') !== -1,
    };
    const userId = context.req.user.userId;
    return await this.feedService.create(userId, createFeedInput, include);
  }

  @Query(() => [Feed], { name: 'feeds' })
  findAll(
    @Args('roomId') roomId: string,
    @Context() context,
    @Info() info,
  ): Promise<Feed[]> {
    const parsedInfo = parse(info);
    const fields = Object.keys(parsedInfo.fieldsByTypeName.Feed);
    const include = {
      comments: fields.indexOf('comments') !== -1,
      user: fields.indexOf('user') !== -1,
    };
    const userId = context.req.user.userId;
    return this.feedService.findAll(roomId, userId, include);
  }

  @Query(() => Feed, { name: 'feed' })
  findOne(
    @Args('id') id: string,
    @Context() context,
    @Info() info,
  ): Promise<Feed> {
    const parsedInfo = parse(info);
    const fields = Object.keys(parsedInfo.fieldsByTypeName.Feed);
    const include = {
      comments: fields.indexOf('comments') !== -1,
      user: fields.indexOf('user') !== -1,
    };
    const userId = context.req.user.userId;
    return this.feedService.findOne(id, userId, include);
  }

  @Mutation(() => Feed)
  updateFeed(
    @Args('updateFeedInput') updateFeedInput: UpdateFeedInput,
    @Args('id') id: string,
    @Context() context,
    @Info() info,
  ): Promise<Feed> {
    const parsedInfo = parse(info);
    const fields = Object.keys(parsedInfo.fieldsByTypeName.Feed);
    const include = {
      comments: fields.indexOf('comments') !== -1,
      user: fields.indexOf('user') !== -1,
    };
    const userId = context.req.user.userId;
    return this.feedService.update(id, updateFeedInput, userId, include);
  }

  @Mutation(() => String)
  removeFeed(@Args('id') id: string, @Context() context): Promise<string> {
    const userId = context.req.user.userId;
    return this.feedService.remove(id, userId);
  }
}
