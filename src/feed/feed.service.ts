import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateFeedInput } from './dto/create-feed.input';
import { UpdateFeedInput } from './dto/update-feed.input';
import { isValidObjectId } from '../lib';
import { PrismaService } from './../prisma/prisma.service';
import { Feed } from './entities/feed.entity';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    userId: string,
    createFeedInput: CreateFeedInput,
  ): Promise<Feed> {
    // validate if room with roomId exists in the database
    if (
      !(await this.validateUserBelongsToRoom(userId, createFeedInput.roomId))
    ) {
      throw new BadRequestException(
        `room with roomId ${createFeedInput.roomId} does not exist!`,
      );
    }

    const feed = await this.prisma.feed.create({
      data: {
        ...createFeedInput,
        userId,
      },
    });

    return feed;
  }

  async findAll(roomId: string, userId: string): Promise<Feed[]> {
    // validate roomId
    if (!isValidObjectId(roomId)) {
      throw new BadRequestException('roomId should be a valid MongoDB id.');
    }

    // only need to validate if the user belongs to this room or not
    if (!(await this.validateUserBelongsToRoom(userId, roomId))) {
      return [];
    }
    return await this.prisma.feed.findMany({
      where: {
        roomId,
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Feed> {
    // validate feedId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('roomId should be a valid MongoDB id.');
    }

    const feed = await this.prisma.feed.findFirst({
      where: {
        id,
      },
    });

    if (!feed) {
      throw new NotFoundException(`Feed with id: ${id} not found`);
    }

    if (!(await this.validateUserBelongsToRoom(userId, feed.roomId))) {
      throw new NotFoundException(`Feed with id: ${id} not found`);
    }
    return feed;
  }

  async update(
    id: string,
    updateFeedInput: UpdateFeedInput,
    userId: string,
  ): Promise<Feed> {
    // validate if id is valid objectId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id should be a valid MongoDB id.');
    }

    // check if feed exists or not
    let feed = await this.prisma.feed.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!feed) {
      throw new NotFoundException(`Feed with id: ${id} not found`);
    }

    // update the feed with the new contents
    feed = await this.prisma.feed.update({
      where: {
        id,
      },
      data: updateFeedInput,
    });

    return feed;
  }

  async remove(id: string, userId: string): Promise<string> {
    // validate if id is valid objectId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id should be a valid MongoDB id.');
    }

    // check if the feed exists or not
    const feed = await this.prisma.feed.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!feed) {
      throw new NotFoundException(`Feed with id: ${id} not found`);
    }
    await this.prisma.$transaction([
      this.prisma.comment.deleteMany({
        where: {
          feedId: id,
        },
      }),
      this.prisma.feed.delete({
        where: {
          id,
        },
      }),
    ]);
    return `Feed with id: ${id} deleted successfully`;
  }

  async validateUserBelongsToRoom(
    userId: string,
    roomId: string,
  ): Promise<boolean> {
    return (
      (await this.prisma.room.count({
        where: {
          id: roomId,
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
      })) !== 0
    );
  }
}
