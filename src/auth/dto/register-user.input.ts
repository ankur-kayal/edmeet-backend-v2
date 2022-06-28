import { Field, InputType } from '@nestjs/graphql';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { IsMongoDBId } from '../../lib/mongodb.validator';

@InputType()
export class RegisterUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsMongoDBId({ message: '$property should be a valid MongoDB id.' })
  id?: string;

  @Field()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: '$property cannot be empty.' })
  name: string;

  @Field()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: '$property cannot be empty.' })
  institution: string;

  @Field()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsEmail({}, { message: '$property should be a valid email.' }) //TODO: @IsEmail() first option, don't know its usage, may break app
  email: string;

  @Field()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(8, {
    message: '$property should contain more than 8 characters.',
  })
  password: string;
}
