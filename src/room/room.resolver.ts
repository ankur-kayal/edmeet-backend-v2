import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { RoomService } from './room.service';
import { Room } from './entities/room.entity';
import { CreateRoomInput } from './dto/create-room.input';
import { UpdateRoomInput } from './dto/update-room.input';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';

@Resolver(() => Room)
@UseGuards(JwtAuthGuard)
export class RoomResolver {
  logger: Logger;
  constructor(private readonly roomService: RoomService) {
    this.logger = new Logger(RoomResolver.name);
  }

  @Mutation(() => Room)
  async createRoom(
    @Args('createRoomInput') createRoomInput: CreateRoomInput,
    @Context() context,
  ) {
    const userId = context.req.user.userId;
    return await this.roomService.create(userId, createRoomInput);
  }

  @Query(() => [Room], { name: 'rooms' })
  async findAll(@Context() context) {
    const userId = context.req.user.userId;
    return await this.roomService.findAll(userId);
  }

  @Query(() => Room, { name: 'room', nullable: true })
  async findOne(@Args('id') id: string, @Context() context) {
    const userId = context.req.user.userId;
    return await this.roomService.findOne(userId, id);
  }

  @Mutation(() => Room)
  async updateRoom(
    @Args('updateRoomInput') updateRoomInput: UpdateRoomInput,
    @Context() context,
  ) {
    const userId = context.req.user.userId;
    return await this.roomService.update(
      userId,
      updateRoomInput.id,
      updateRoomInput,
    );
  }

  @Mutation(() => String)
  async removeRoom(@Args('id') id: string, @Context() context) {
    const userId = context.req.user.userId;
    return await this.roomService.remove(userId, id);
  }

  @Mutation(() => String)
  async joinRoom(@Args('id') id: string, @Context() context) {
    const userId = context.req.user.userId;
    return await this.roomService.joinRoom(userId, id);
  }

  @Mutation(() => String)
  async leaveRoom(@Args('id') id: string, @Context() context) {
    const userId = context.req.user.userId;
    return await this.roomService.leaveRoom(userId, id);
  }
}
