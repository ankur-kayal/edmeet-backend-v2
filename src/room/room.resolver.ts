import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { RoomService } from './room.service';
import { Room } from './entities/room.entity';
import { CreateRoomInput } from './dto/create-room.input';
import { UpdateRoomInput } from './dto/update-room.input';

@Resolver(() => Room)
export class RoomResolver {
  constructor(private readonly roomService: RoomService) {}

  @Mutation(() => Room)
  async createRoom(@Args('createRoomInput') createRoomInput: CreateRoomInput) {
    return await this.roomService.create(createRoomInput);
  }

  @Query(() => [Room], { name: 'rooms' })
  async findAll() {
    return await this.roomService.findAll();
  }

  @Query(() => Room, { name: 'room', nullable: true })
  async findOne(@Args('id') id: string) {
    return await this.roomService.findOne(id);
  }

  @Mutation(() => Room)
  async updateRoom(@Args('updateRoomInput') updateRoomInput: UpdateRoomInput) {
    return await this.roomService.update(updateRoomInput.id, updateRoomInput);
  }

  @Mutation(() => String)
  async removeRoom(@Args('id') id: string) {
    return await this.roomService.remove(id);
  }
}
