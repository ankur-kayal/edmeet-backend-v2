import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Feed {
  @Field()
  id: string;

  @Field()
  text: string;

  @Field()
  roomId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
