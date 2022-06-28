import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserInput } from './dto/update-user.input';

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
  ) {
    this.logger.log(context.req.user);
    return await this.userService.update(
      context.req.user.userId,
      updateUserInput,
    );
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async removeUser(@Context() context) {
    this.logger.log('Removing User: ', context.req.user);
    return await this.userService.remove(context.req.user.userId);
  }
}
