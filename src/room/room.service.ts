import { BadRequestException, Injectable } from '@nestjs/common';
import { Room } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomInput } from './dto/create-room.input';
import { UpdateRoomInput } from './dto/update-room.input';

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
    let room = undefined;
    try {
      room = await this.prisma.room.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new BadRequestException('id should be an MongoDB ObjectId');
    }

    return room;
  }

  async update(id: string, updateRoomInput: UpdateRoomInput): Promise<Room> {
    // check if room exists or not

    let room = await this.prisma.room.findUnique({
      where: {
        id,
      },
    });

    if (!room) {
      throw new BadRequestException(`room with roomId ${id} does not exists`);
    }

    // update the room with the new contents
    room = await this.prisma.room.update({
      where: {
        id,
      },
      data: updateRoomInput,
    });

    return room;
  }

  async remove(id: string) {
    // check if room exists or not

    const room = await this.prisma.room.findUnique({
      where: {
        id,
      },
    });

    if (!room) {
      throw new BadRequestException(`room with roomId ${id} does not exists`);
    }

    await this.prisma.room.delete({
      where: {
        id,
      },
    });
  }
}
