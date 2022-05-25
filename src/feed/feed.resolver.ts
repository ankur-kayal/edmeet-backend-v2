import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { FeedService } from './feed.service';
import { Feed } from './entities/feed.entity';
import { CreateFeedInput } from './dto/create-feed.input';
import { UpdateFeedInput } from './dto/update-feed.input';

@Resolver(() => Feed)
export class FeedResolver {
  constructor(private readonly feedService: FeedService) {}

  @Mutation(() => Feed)
  async createFeed(
    @Args('createFeedInput') createFeedInput: CreateFeedInput,
  ): Promise<Feed> {
    return await this.feedService.create(createFeedInput);
  }

  @Query(() => [Feed], { name: 'feeds' })
  findAll(): Promise<Feed[]> {
    return this.feedService.findAll();
  }

  @Query(() => Feed, { name: 'feed' })
  findOne(@Args('id') id: string): Promise<Feed> {
    return this.feedService.findOne(id);
  }

  @Mutation(() => Feed)
  updateFeed(
    @Args('updateFeedInput') updateFeedInput: UpdateFeedInput,
    @Args('id') id: string,
  ): Promise<Feed> {
    return this.feedService.update(id, updateFeedInput);
  }

  @Mutation(() => String)
  removeFeed(@Args('id') id: string): Promise<string> {
    return this.feedService.remove(id);
  }
}
