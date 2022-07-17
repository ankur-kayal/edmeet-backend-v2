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

interface ICommentInclude {
  feed: boolean;
  user: boolean;
}

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    createCommentInput: CreateCommentInput,
    userId: string,
    include: ICommentInclude,
  ): Promise<Comment> {
    const { roomId, feedId } = createCommentInput;

    // validate if room with roomId exists in the database

    if (!(await this.checkUserExistsInRoom(roomId, userId))) {
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
      select: {
        id: true,
        commentCount: true,
      },
    });

    if (!feed) {
      throw new BadRequestException(
        `feed with feedId ${feedId} belonging to room with roomId ${roomId} does not exist!`,
      );
    }

    const [comment] = await this.prisma.$transaction([
      this.prisma.comment.create({
        data: {
          ...createCommentInput,
          userId,
        },
        include,
      }),
      this.prisma.feed.update({
        where: {
          id: feed.id,
        },
        data: {
          commentCount: feed.commentCount + 1,
        },
      }),
    ]);

    return comment;
  }

  async findAll(
    roomId: string,
    feedId: string,
    userId: string,
    include: ICommentInclude,
  ): Promise<Comment[]> {
    // validate if the user is a member of the room
    if (!(await this.checkUserExistsInRoom(roomId, userId))) {
      throw new BadRequestException(`User does not belong to room: ${roomId}`);
    }
    return await this.prisma.comment.findMany({
      where: {
        roomId,
        feedId,
      },
      include,
    });
  }

  async findOne(
    id: string,
    userId: string,
    include: ICommentInclude,
  ): Promise<Comment> {
    // validate feedId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('commentId should be a valid MongoDB id.');
    }

    // check if comment exists in the database
    const comment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
      include,
    });

    // check if the user is a member of the room where the comment is associated
    if (
      !comment ||
      !(await this.checkUserExistsInRoom(comment.roomId, userId))
    ) {
      throw new NotFoundException(`Comment with id: ${id} not found`);
    }

    return comment;
  }

  async update(
    id: string,
    updateCommentInput: UpdateCommentInput,
    userId: string,
    include: ICommentInclude,
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

    // validate if the user is the creator of the comment
    if (!comment || comment.userId !== userId) {
      throw new NotFoundException(`Comment with id: ${id} not found`);
    }

    // update the comment with new contents
    comment = await this.prisma.comment.update({
      where: {
        id,
      },
      data: updateCommentInput,
      include,
    });
    return comment;
  }

  async remove(id: string, userId: string): Promise<string> {
    // validate if id is valid objectId
    if (!isValidObjectId(id)) {
      throw new BadRequestException('id should be a valid MongoDB id.');
    }
    const comment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
    });

    // validate if the user is the creator of the comment
    if (!comment || comment.userId !== userId) {
      throw new NotFoundException(`Comment with id: ${id} not found`);
    }

    const feed = await this.prisma.feed.findUnique({
      where: {
        id: comment.feedId,
      },
      select: {
        id: true,
        commentCount: true,
      },
    });

    await this.prisma.$transaction([
      this.prisma.comment.delete({
        where: {
          id,
        },
      }),
      this.prisma.feed.update({
        where: {
          id: feed.id,
        },
        data: {
          commentCount: feed.commentCount - 1,
        },
      }),
    ]);

    return `Comment with id: ${id} deleted successfully`;
  }

  async checkUserExistsInRoom(
    roomId: string,
    userId: string,
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
      })) === 1
    );
  }
}
