import { ObjectType, Field } from '@nestjs/graphql';
import { Feed } from './../../feed/entities/feed.entity';
import { User } from './../../user/entities/user.entity';

@ObjectType()
export class Room {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  code: string;

  @Field()
  photo: string;

  @Field(() => [Feed], { nullable: true })
  feeds?: Feed[];

  @Field(() => [User], { nullable: true })
  editors?: User[];

  @Field(() => [String])
  editorIds: string[];

  @Field(() => [User], { nullable: true })
  viewers?: User[];

  @Field(() => [String])
  viewerIds: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
