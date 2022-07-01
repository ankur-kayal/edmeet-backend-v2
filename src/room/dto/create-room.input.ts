import { InputType, Field } from '@nestjs/graphql';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { IsMongoDBId } from '../../lib/mongodb.validator';

@InputType()
export class CreateRoomInput {
  @Field({ nullable: true })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsMongoDBId({ message: '$property should be a valid MongoDB id.' })
  id?: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field()
  code: string;

  @Field({ nullable: true })
  @IsOptional()
  photo?: string;
}
