import { InputType, Field } from '@nestjs/graphql';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: '$property cannot be empty.' })
  name: string;
}
