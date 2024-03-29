import { Args, Context, Info, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserInput } from './dto/update-user.input';
import { parse } from 'graphql-parse-resolve-info';

@Resolver(() => User)
export class UserResolver {
  logger: Logger;
  constructor(private readonly userService: UserService) {
    this.logger = new Logger(UserResolver.name);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @Context() context,
    @Info() info,
  ) {
    const parsedInfo = parse(info);
    const fields = Object.keys(parsedInfo.fieldsByTypeName.User);
    const include = {
      editRooms: fields.indexOf('editRooms') !== -1,
      viewRooms: fields.indexOf('viewRooms') !== -1,
      feeds: fields.indexOf('feeds') !== -1,
      comments: fields.indexOf('comments') !== -1,
    };
    this.logger.log(context.req.user);
    return await this.userService.update(
      context.req.user.userId,
      updateUserInput,
      include,
    );
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async removeUser(@Context() context) {
    this.logger.log('Removing User: ', context.req.user);
    return await this.userService.remove(context.req.user.userId);
  }
}
