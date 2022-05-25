import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateFeedInput {
  @IsNotEmpty({ message: 'Feed text cannot be empty!' })
  @Field()
  text: string;
}
