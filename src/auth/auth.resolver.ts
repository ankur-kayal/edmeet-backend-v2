import {
  Resolver,
  Mutation,
  Args,
  Context,
  Query,
  Info,
} from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Logger, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { LoginResponse } from './dto/login-response';
import { LoginUserInput } from './dto/login-user.input';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { RegisterUserInput } from './dto/register-user.input';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { parse } from 'graphql-parse-resolve-info';

@Resolver()
export class AuthResolver {
  logger: Logger;
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    this.logger = new Logger(AuthResolver.name);
  }

  @Query(() => LoginResponse)
  @UseGuards(GqlAuthGuard)
  async loginUser(
    @Args('loginUserInput') loginUserInput: LoginUserInput,
    @Context() context,
  ) {
    return await this.authService.login(context.user);
  }

  @Mutation(() => User)
  async registerUser(
    @Args('registerUserInput') registerUserInput: RegisterUserInput,
    @Info() info,
  ) {
    const parsedInfo = parse(info);
    const fields = Object.keys(parsedInfo.fieldsByTypeName.User);
    const include = {
      editRooms: fields.indexOf('editRooms') !== -1,
      viewRooms: fields.indexOf('viewRooms') !== -1,
    };
    this.logger.debug('Received registration data: ', registerUserInput);
    return await this.authService.register(registerUserInput, include);
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Context() context, @Info() info) {
    const parsedInfo = parse(info);
    const fields = Object.keys(parsedInfo.fieldsByTypeName.User);
    const include = {
      editRooms: fields.indexOf('editRooms') !== -1,
      viewRooms: fields.indexOf('viewRooms') !== -1,
    };
    this.logger.log(context.req.user);
    return await this.userService.findOne(context.req.user.email, include);
  }
}
