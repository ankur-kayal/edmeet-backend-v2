import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { Comment } from './entities/comment.entity';
import { isValidObjectId } from './../lib/validate-objectId';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createCommentInput: CreateCommentInput): Promise<Comment> {
    const { roomId, feedId } = createCommentInput;

    // validate if room with roomId exists in the database
    const room = await this.prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });
    if (!room) {
      throw new BadRequestException(
        `room with roomId ${roomId} does not exist!`,
      );
    }

    // validate if feed with feedId exists in the database
    const feed = await this.prisma.feed.findFirst({
      where: {
        id: feedId,
        roomId: roomId,
      },
    });
    if (!feed) {
      throw new BadRequestException(
        `feed with feedId ${feedId} belonging to room with roomId ${roomId} does not exist!`,
      );
    }

    return await this.prisma.comment.create({
      data: createCommentInput,
    });
  }

  async findAll(): Promise<Comment[]> {
    return await this.prisma.comment.findMany();
  }

  async findOne(id: string): Promise<Comment> {
    // validate feedId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('commentId should be a valid MongoDB id.');
    }

    // check if comment exists in the database
    const comment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with id: ${id} not found`);
    }
    return comment;
  }

  async update(
    id: string,
    updateCommentInput: UpdateCommentInput,
  ): Promise<Comment> {
    // validate if id is valid objectId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id should be a valid MongoDB id.');
    }

    // validate if comment with id exists
    let comment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with id: ${id} not found`);
    }

    // update the comment with new contents
    comment = await this.prisma.comment.update({
      where: {
        id,
      },
      data: updateCommentInput,
    });
    return comment;
  }

  async remove(id: string): Promise<string> {
    // validate if id is valid objectId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id should be a valid MongoDB id.');
    }

    const comment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id: ${id} not found`);
    }
    await this.prisma.comment.delete({
      where: {
        id,
      },
    });

    return `Comment with id: ${id} deleted successfully`;
  }
}
