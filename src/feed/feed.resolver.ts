import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { FeedService } from './feed.service';
import { Feed } from './entities/feed.entity';
import { CreateFeedInput } from './dto/create-feed.input';
import { UpdateFeedInput } from './dto/update-feed.input';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Feed)
@UseGuards(JwtAuthGuard)
export class FeedResolver {
  constructor(private readonly feedService: FeedService) {}

  @Mutation(() => Feed)
  async createFeed(
    @Args('createFeedInput') createFeedInput: CreateFeedInput,
    @Context() context,
  ): Promise<Feed> {
    const userId = context.req.user.userId;
    return await this.feedService.create(userId, createFeedInput);
  }

  @Query(() => [Feed], { name: 'feeds' })
  findAll(@Args('roomId') roomId: string, @Context() context): Promise<Feed[]> {
    const userId = context.req.user.userId;
    return this.feedService.findAll(roomId, userId);
  }

  @Query(() => Feed, { name: 'feed' })
  findOne(@Args('id') id: string, @Context() context): Promise<Feed> {
    const userId = context.req.user.userId;
    return this.feedService.findOne(id, userId);
  }

  @Mutation(() => Feed)
  updateFeed(
    @Args('updateFeedInput') updateFeedInput: UpdateFeedInput,
    @Args('id') id: string,
    @Context() context,
  ): Promise<Feed> {
    const userId = context.req.user.userId;
    return this.feedService.update(id, updateFeedInput, userId);
  }

  @Mutation(() => String)
  removeFeed(@Args('id') id: string, @Context() context): Promise<string> {
    const userId = context.req.user.userId;
    return this.feedService.remove(id, userId);
  }
}
