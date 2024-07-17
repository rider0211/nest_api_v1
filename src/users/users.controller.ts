import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema/user.schema';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  async create(@Body() createUserDto: any): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }
  @Get(':userId')
  async findOne(@Param('userId') userId: string): Promise<User> {
    return this.usersService.findUserById(userId);
  }
  @Get(':userId/avatar')
  async getAvatar(@Param('userId') userId: string): Promise<string> {
    return this.usersService.getUserAvatar(userId);
  }
  @Delete(':userId/avatar')
  async removeAvatar(@Param('userId') userId: string): Promise<void> {
    return this.usersService.deleteUserAvatar(userId);
  }
}
