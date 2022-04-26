import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Room } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomInput } from './dto/create-room.input';
import { UpdateRoomInput } from './dto/update-room.input';

import { isValidObjectId } from '../lib';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createRoomInput: CreateRoomInput) {
    return await this.prisma.room.create({
      data: createRoomInput,
    });
  }

  async findAll() {
    return await this.prisma.room.findMany();
  }

  async findOne(id: string): Promise<Room> {
    // validate if id is valid objectId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id should be a valid MongoDB ObjectId');
    }
    let room = null;
    room = await this.prisma.room.findUnique({
      where: {
        id,
      },
    });

    if (room == null) {
      throw new NotFoundException(`Room with id: ${id} not found`);
    }

    return room;
  }

  async update(id: string, updateRoomInput: UpdateRoomInput): Promise<Room> {
    // validate if id is valid objectId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id should be a valid MongoDB ObjectId');
    }

    // check if room exists or not
    let room = await this.prisma.room.findUnique({
      where: {
        id,
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with id: ${id} not found`);
    }

    delete updateRoomInput.id;

    // update the room with the new contents
    room = await this.prisma.room.update({
      where: {
        id,
      },
      data: updateRoomInput,
    });

    return room;
  }

  async remove(id: string): Promise<string> {
    // validate if id is valid objectId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id should be a valid MongoDB ObjectId');
    }
    // check if room exists or not

    const room = await this.prisma.room.findUnique({
      where: {
        id,
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with id: ${id} not found`);
    }

    await this.prisma.room.delete({
      where: {
        id,
      },
    });

    return `Room with roomId: ${id} deleted successfully`;
  }
}
