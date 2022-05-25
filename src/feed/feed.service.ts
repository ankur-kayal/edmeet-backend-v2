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
  async create(createFeedInput: CreateFeedInput): Promise<Feed> {
    // validate roomId
    if (!isValidObjectId(createFeedInput.roomId)) {
      throw new BadRequestException(
        'roomId should be a valid MongoDB ObjectId',
      );
    }

    // validate if room with roomId exists in the database
    if (
      !(await this.prisma.room.count({
        where: {
          id: createFeedInput.roomId,
        },
      }))
    ) {
      throw new BadRequestException(
        `room with roomId ${createFeedInput.roomId} does not exist!`,
      );
    }

    const feed = await this.prisma.feed.create({
      data: {
        ...createFeedInput,
      },
    });

    return feed;
  }

  async findAll(): Promise<Feed[]> {
    return await this.prisma.feed.findMany();
  }

  async findOne(id: string): Promise<Feed> {
    // validate feedId
    if (!isValidObjectId(id)) {
      throw new BadRequestException(
        'roomId should be a valid MongoDB ObjectId',
      );
    }

    const feed = await this.prisma.feed.findUnique({
      where: {
        id,
      },
    });

    if (!feed) {
      throw new NotFoundException(`Feed with id: ${id} not found`);
    }
    return feed;
  }

  async update(id: string, updateFeedInput: UpdateFeedInput): Promise<Feed> {
    // validate if id is valid objectId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id should be a valid MongoDB ObjectId');
    }

    // check if feed exists or not
    let feed = await this.prisma.feed.findUnique({
      where: {
        id,
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

  async remove(id: string): Promise<string> {
    // validate if id is valid objectId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id should be a valid MongoDB ObjectId');
    }

    // check if the feed exists or not
    const feed = await this.prisma.feed.findUnique({
      where: {
        id,
      },
    });

    if (!feed) {
      throw new NotFoundException(`Feed with id: ${id} not found`);
    }

    await this.prisma.feed.delete({
      where: {
        id,
      },
    });
    return `Feed with id: ${id} deleted successfully`;
  }
}
