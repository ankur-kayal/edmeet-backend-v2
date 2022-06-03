import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Comment {
  @Field()
  id: string;

  @Field()
  text: string;

  @Field()
  feedId: string;

  @Field()
  roomId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
