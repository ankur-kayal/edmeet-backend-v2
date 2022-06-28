import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './entities/user.entity';
import { RegisterUserInput } from '../auth/dto/register-user.input';
import * as argon from 'argon2';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UserService {
  logger: Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(UserService.name);
  }

  async create(createUserInput: RegisterUserInput) {
    this.logger.debug('Creating user with input: ', createUserInput);
    createUserInput.password = await argon.hash(createUserInput.password);
    return await this.prisma.user.create({
      data: createUserInput,
      include: {
        editRooms: true,
        viewRooms: true,
      },
    });
  }

  async findOne(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        editRooms: true,
        viewRooms: true,
      },
    });

    this.logger.debug(user);
    return user;
  }

  async update(id: string, updateUserInput: UpdateUserInput) {
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: updateUserInput,
      include: {
        editRooms: true,
        viewRooms: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    // validate if any one of the rooms with edit access has more than 2 editors

    const rooms = await this.prisma.room.findMany({
      where: {
        OR: [
          {
            id: {
              in: user.editRoomIds,
            },
          },
          {
            id: {
              in: user.viewRoomIds,
            },
          },
        ],
      },
    });

    let canDelete = true;

    const onlyEditorRooms = [];

    rooms.forEach((room) => {
      if (room.editorIds.indexOf(id) !== -1 && room.editorIds.length === 1) {
        canDelete = false;
        onlyEditorRooms.push({
          roomId: room.id,
          name: room.name,
        });
      }
    });

    if (canDelete) {
      await this.prisma.user.delete({
        where: {
          id,
        },
      });

      return `User with id: ${id} removed successfully!`;
    } else {
      throw new BadRequestException({
        message: 'User is the only editor in some of the rooms.',
        rooms: onlyEditorRooms,
        statusCode: 400,
      });
    }
  }
}
