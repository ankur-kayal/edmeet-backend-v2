import { ObjectType, Field } from '@nestjs/graphql';
import { Room } from './../../room/entities/room.entity';

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

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
