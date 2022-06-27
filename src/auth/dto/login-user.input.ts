import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class LoginUserInput {
  @Field()
  @IsEmail({ message: 'Please enter a valid email.' })
  email: string;

  @Field()
  password: string;
}
