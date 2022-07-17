import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { Comment } from '../../comment/entities/comment.entity';

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

  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];

  @Field()
  userId: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
