import { CreateRoomInput } from './create-room.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateRoomInput extends PartialType(CreateRoomInput) {
  @Field()
  id: string;
}
