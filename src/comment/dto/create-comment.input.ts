import { InputType, Field } from '@nestjs/graphql';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { IsMongoDBId } from '../../lib/mongodb.validator';

@InputType()
export class CreateCommentInput {
  @Field({ nullable: true })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsMongoDBId({ message: '$property should be a valid MongoDB id.' })
  id?: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Comment text cannot be empty!' })
  @Field()
  text: string;

  @Field()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsMongoDBId({ message: '$property should be a valid MongoDB id.' })
  roomId: string;

  @Field()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsMongoDBId({ message: '$property should be a valid MongoDB id.' })
  feedId: string;
}
