import { ObjectType, Field } from '@nestjs/graphql';
import { Room } from './../../room/entities/room.entity';
import { Feed } from './../../feed/entities/feed.entity';
import { Comment } from '../../comment/entities/comment.entity';

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

  @Field(() => [String])
  editRoomIds: string[];

  @Field(() => [Room], { nullable: true })
  editRooms?: Room[];

  @Field(() => [String])
  viewRoomIds: string[];

  @Field(() => [Room], { nullable: true })
  viewRooms?: Room[];

  @Field(() => [Feed], { nullable: true })
  feeds?: Feed[];

  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
