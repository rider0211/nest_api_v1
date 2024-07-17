import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema/user.schema';
import { AxiosResponse } from 'axios';
import { readFile, writeFile, unlink } from 'fs/promises';
import { createHash } from 'crypto';
import * as path from 'path';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
@Injectable()
export class UsersService {
  private client: ClientProxy;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly httpService: HttpService,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'main_queue',
        queueOptions: {
          durable: false,
        },
      },
    });
  }
  async createUser(createUserDto: any): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    const user = await createdUser.save();
    this.client.emit('user_created', user);
    return user;
  }
  async findUserById(userId: string): Promise<User> {
    return this.httpService
      .get(`https://reqres.in/api/users/${userId}`)
      .toPromise()
      .then((response: AxiosResponse) => response.data.data);
  }
  async getUserAvatar(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId).exec();
    if (user && user.avatar) {
      const avatarPath = path.resolve(`./avatars/${user.avatarHash}`);
      try {
        const image = await readFile(avatarPath);
        return image.toString('base64');
      } catch {
        return this.downloadAvatar(user.avatar, userId);
      }
    }
    const apiUser = await this.findUserById(userId);
    return this.downloadAvatar(apiUser.avatar, userId);
  }
  async downloadAvatar(url: string, userId: string): Promise<string> {
    const response = await this.httpService.axiosRef.get(url, {
      responseType: 'arraybuffer',
    });
    const avatarHash = createHash('md5').update(response.data).digest('hex');
    const avatarPath = path.resolve(`./avatars/${avatarHash}`);
    await writeFile(avatarPath, response.data);
    const user = await this.userModel.findById(userId).exec();
    user.avatar = url;
    user.avatarHash = avatarHash;
    await user.save();
    return response.data.toString('base64');
  }
  async deleteUserAvatar(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (user && user.avatarHash) {
      const avatarPath = path.resolve(`./avatars/${user.avatarHash}`);
      await unlink(avatarPath);
      user.avatar = null;
      user.avatarHash = null;
      await user.save();
    }
  }
}
