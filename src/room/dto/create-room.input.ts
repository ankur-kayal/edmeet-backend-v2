import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateRoomInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  code: string;

  @Field({ nullable: true })
  photo: string;
}
