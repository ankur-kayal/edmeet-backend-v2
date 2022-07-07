import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Room } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomInput } from './dto/create-room.input';
import { UpdateRoomInput } from './dto/update-room.input';

import { isValidObjectId } from '../lib';

interface IRoomInclude {
  feeds: boolean;
  viewers: boolean;
  editors: boolean;
}

@Injectable()
export class RoomService {
  logger: Logger;
  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(RoomService.name);
  }
  async create(
    userId: string,
    createRoomInput: CreateRoomInput,
    include: IRoomInclude,
  ) {
    this.logger.debug('Creating room with input: ', createRoomInput);

    // create the room
    const room = await this.prisma.room.create({
      data: {
        ...createRoomInput,
        editorIds: {
          set: [userId],
        },
      },
      include,
    });

    // update the user
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        editRoomIds: {
          push: room.id,
        },
      },
    });

    return room;
  }

  async findAll(userId: string, include: IRoomInclude) {
    this.logger.debug(userId);
    return await this.prisma.room.findMany({
      where: {
        OR: [
          {
            editorIds: {
              has: userId,
            },
          },
          {
            viewerIds: {
              has: userId,
            },
          },
        ],
      },
      include,
    });
  }

  async findOne(
    userId: string,
    id: string,
    include: IRoomInclude,
  ): Promise<Room> {
    // validate if id is valid objectId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id should be a valid MongoDB id.');
    }
    let room: Room = null;
    room = await this.prisma.room.findFirst({
      where: {
        id,
        OR: [
          {
            editorIds: {
              has: userId,
            },
          },
          {
            viewerIds: {
              has: userId,
            },
          },
        ],
      },
      include,
    });

    if (room == null) {
      throw new NotFoundException(`Room with id: ${id} not found`);
    }

    return room;
  }

  async update(
    userId: string,
    id: string,
    updateRoomInput: UpdateRoomInput,
    include: IRoomInclude,
  ): Promise<Room> {
    // validate if id is valid objectId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id should be a valid MongoDB id.');
    }

    // check if room exists or not
    let room = await this.prisma.room.findFirst({
      where: {
        id,
        editorIds: {
          has: userId,
        },
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
      include,
    });

    return room;
  }

  async remove(userId: string, id: string): Promise<string> {
    // validate if id is valid objectId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id should be a valid MongoDB id.');
    }

    // check if room exists or not
    const room = await this.prisma.room.findFirst({
      where: {
        id,
        editorIds: {
          has: userId,
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with id: ${id} not found`);
    }
    // can be optimised later
    const { editorIds, viewerIds } = room;
    editorIds.forEach(async (editorId) => {
      const currentUser = await this.prisma.user.findUnique({
        where: {
          id: editorId,
        },
      });

      let { editRoomIds } = currentUser;
      editRoomIds = editRoomIds.filter((roomId) => roomId !== id);

      this.logger.debug(currentUser, editRoomIds);

      // update the user
      await this.prisma.user.update({
        where: {
          id: editorId,
        },
        data: {
          editRoomIds,
        },
      });
    });

    viewerIds.forEach(async (viewerId) => {
      const currentUser = await this.prisma.user.findUnique({
        where: {
          id: viewerId,
        },
      });

      let { viewRoomIds } = currentUser;
      viewRoomIds = viewRoomIds.filter((roomId) => roomId !== id);

      // update the user
      await this.prisma.user.update({
        where: {
          id: viewerId,
        },
        data: {
          viewRoomIds,
        },
      });
    });

    // now delete the comments and feeds
    await this.prisma.comment.deleteMany({
      where: {
        roomId: id,
      },
    });
    await this.prisma.feed.deleteMany({
      where: {
        roomId: id,
      },
    });

    await this.prisma.room.delete({
      where: {
        id,
      },
    });

    return `Room with roomId: ${id} deleted successfully`;
  }

  async joinRoom(userId: string, id: string) {
    // validate if id is valid objectId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id should be a valid MongoDB id.');
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

    // check if the user is already a part of the room or not
    if (
      room.editorIds.indexOf(userId) !== -1 ||
      room.viewerIds.indexOf(userId) !== -1
    ) {
      throw new BadRequestException(`User is already a part of this room.`);
    }

    // by default you can join room as a viewer
    await this.prisma.$transaction([
      this.prisma.room.update({
        where: {
          id,
        },
        data: {
          viewerIds: {
            push: userId,
          },
        },
      }),
      this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          viewRoomIds: {
            push: id,
          },
        },
      }),
    ]);

    return `Room with id: ${id} joined successfully.`;
  }

  async leaveRoom(userId: string, id: string) {
    // validate if id is valid objectId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id should be a valid MongoDB id.');
    }

    // check if room exists or not
    const room = await this.prisma.room.findFirst({
      where: {
        id,
        OR: [
          {
            viewerIds: {
              has: userId,
            },
          },
          {
            editorIds: {
              has: userId,
            },
          },
        ],
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with id: ${id} not found`);
    }

    const { editRoomIds, viewRoomIds } = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const { editorIds, viewerIds } = room;

    let userUpdateData = {};
    if (editRoomIds.indexOf(id) !== -1) {
      userUpdateData = {
        editRoomIds: editRoomIds.filter((roomId) => roomId !== id),
      };
    } else {
      userUpdateData = {
        viewRoomIds: viewRoomIds.filter((roomId) => roomId !== id),
      };
    }

    let roomUpdateData = {};
    if (editorIds.indexOf(userId) !== -1) {
      if (editorIds.length === 1) {
        throw new BadRequestException(
          `User is the only editor in this room. Leave room unsuccessful.`,
        );
      }
      roomUpdateData = {
        editorIds: editorIds.filter((editorId) => editorId !== userId),
      };
    } else {
      roomUpdateData = {
        viewerIds: viewerIds.filter((viewerId) => viewerId !== userId),
      };
    }

    // update the room and user objects
    await this.prisma.$transaction([
      this.prisma.room.update({
        where: {
          id,
        },
        data: roomUpdateData,
      }),
      this.prisma.user.update({
        where: {
          id: userId,
        },
        data: userUpdateData,
      }),
    ]);

    return `Room with id: ${id} left successfully.`;
  }
}
