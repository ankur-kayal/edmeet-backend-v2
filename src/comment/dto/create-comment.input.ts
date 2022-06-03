import { InputType, Field } from '@nestjs/graphql';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Comment text cannot be empty!' })
  @Field()
  text: string;

  @Field()
  roomId: string;

  @Field()
  feedId: string;
}
