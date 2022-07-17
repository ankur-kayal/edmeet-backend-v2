import { ObjectType, Field } from '@nestjs/graphql';
import { User } from './../../user/entities/user.entity';
import { Feed } from './../../feed/entities/feed.entity';

@ObjectType()
export class Comment {
  @Field()
  id: string;

  @Field()
  text: string;

  @Field()
  feedId: string;

  @Field(() => Feed, { nullable: true })
  feed?: Feed;

  @Field()
  roomId: string;

  @Field()
  userId: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
