import { InputType, Field } from '@nestjs/graphql';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { IsMongoDBId } from '../../lib/mongodb.validator';

@InputType()
export class CreateFeedInput {
  @Field({ nullable: true })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsMongoDBId({ message: '$property should be a valid MongoDB id.' })
  id?: string;

  @Field()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Feed text cannot be empty!' })
  text: string;

  @Field()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsMongoDBId({ message: '$property should be a valid MongoDB id.' })
  roomId: string;
}
