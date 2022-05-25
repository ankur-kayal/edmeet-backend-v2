import { InputType, Field } from '@nestjs/graphql';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateFeedInput {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Feed text cannot be empty!' })
  @Field()
  text: string;

  @IsNotEmpty({ message: 'roomId cannot be empty!' })
  @Field()
  roomId: string;
}
