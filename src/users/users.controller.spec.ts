import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
const mockUser = {
  _id: '1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: 'https://reqres.in/img/faces/1-image.jpg',
  avatarHash: 'abc123',
};
describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn().mockResolvedValue(mockUser),
            findUserById: jest.fn().mockResolvedValue(mockUser),
            getUserAvatar: jest.fn().mockResolvedValue('base64image'),
            deleteUserAvatar: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();
    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should create a user', async () => {
    const user = await controller.create(mockUser);
    expect(user).toEqual(mockUser);
  });
  it('should find a user by ID', async () => {
    const user = await controller.findOne('1');
    expect(user).toEqual(mockUser);
  });
  it('should get user avatar', async () => {
    const avatar = await controller.getAvatar('1');
    expect(avatar).toEqual('base64image');
  });
  it('should delete user avatar', async () => {
    await controller.removeAvatar('1');
    expect(service.deleteUserAvatar).toHaveBeenCalledWith('1');
  });
});
