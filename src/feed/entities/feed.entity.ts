import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Feed {
  @Field()
  id: string;

  @Field()
  text: string;

  @Field()
  roomId: string;

  @Field(() => Int)
  commentCount: number;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
