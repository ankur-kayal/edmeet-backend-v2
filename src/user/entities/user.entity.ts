import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  institution: string;

  @Field()
  email: string;

  password: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
