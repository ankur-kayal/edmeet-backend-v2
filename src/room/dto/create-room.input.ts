import { InputType, Field } from '@nestjs/graphql';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsMongoDBId } from '../../lib/mongodb.validator';

@InputType()
export class CreateRoomInput {
  @Field({ nullable: true })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsMongoDBId({ message: '$property should be a valid MongoDB id.' })
  id?: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  code: string;

  @Field({ nullable: true })
  photo?: string;
}
