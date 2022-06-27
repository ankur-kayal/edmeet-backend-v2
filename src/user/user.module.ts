import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';

@Module({
  exports: [UserService],
  providers: [UserResolver, UserService],
})
export class UserModule {}
