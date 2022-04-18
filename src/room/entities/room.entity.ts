import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Room {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  code: string;

  @Field()
  photo: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
