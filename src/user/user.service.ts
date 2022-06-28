import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './entities/user.entity';
import { RegisterUserInput } from '../auth/dto/register-user.input';
import * as argon from 'argon2';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UserService {
  logger: Logger;

  constructor(private readonly prismaService: PrismaService) {
    this.logger = new Logger(UserService.name);
  }

  async create(createUserInput: RegisterUserInput) {
    this.logger.debug('Creating user with input: ', createUserInput);
    createUserInput.password = await argon.hash(createUserInput.password);
    return await this.prismaService.user.create({
      data: createUserInput,
    });
  }

  async findOne(email: string): Promise<User> {
    return await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async update(id: string, updateUserInput: UpdateUserInput) {
    return await this.prismaService.user.update({
      where: {
        id,
      },
      data: updateUserInput,
    });
  }

  async remove(id: string) {
    await this.prismaService.user.delete({
      where: {
        id,
      },
    });

    return `User with id: ${id} removed successfully!`;
  }
}
