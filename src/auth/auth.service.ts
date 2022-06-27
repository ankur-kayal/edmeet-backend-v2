import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { RegisterUserInput } from './dto/register-user.input';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  logger: Logger;
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    this.logger = new Logger(AuthService.name);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user: User = await this.userService.findOne(email);

    if (user && (await argon.verify(user.password, password))) {
      return user;
    }

    return null;
  }

  async login(user: User) {
    return {
      access_token: this.jwtService.sign({
        email: user.email,
        sub: user.id,
      }),
      user,
    };
  }

  async register(registerUserInput: RegisterUserInput) {
    const user = await this.userService.findOne(registerUserInput.email);

    if (user) {
      throw new BadRequestException({
        field: 'email',
        error: `User with email: ${registerUserInput.email} already exists.`,
      });
    }

    return await this.userService.create(registerUserInput);
  }
}
