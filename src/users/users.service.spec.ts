import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema/user.schema';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

const mockUser = {
  _id: '1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: 'https://reqres.in/img/faces/1-image.jpg',
  avatarHash: 'abc123',
};

class UserModel {
  constructor(private data: any) {
    Object.assign(this, data);
  }

  save = jest.fn().mockResolvedValue(this.data);
  
  static create = jest.fn().mockImplementation((dto) => {
    return new UserModel({ ...dto, ...mockUser });
  });

  static findById = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockUser),
  });
}

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<User>;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: UserModel,
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn().mockReturnValue(of({ data: { data: mockUser } })),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserDto = { name: 'Test User', email: 'test@example.com' };
    const user = await service.createUser(createUserDto);
    expect(user).toEqual({ ...createUserDto, ...mockUser });
    expect(UserModel.create).toHaveBeenCalledWith(createUserDto);
  });

  it('should find a user by id', async () => {
    const user = await service.findUserById('1');
    expect(user).toEqual(mockUser);
    expect(UserModel.findById).toHaveBeenCalledWith('1');
  });

});
