import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema/user.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Users API (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let userModel: Model<User>;
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        AppModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
  });
  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });
  afterEach(async () => {
    await userModel.deleteMany({});
  });
  it('/api/users (POST) should create a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send({ name: 'Test User', email: 'test@example.com' })
      .expect(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe('Test User');
    expect(response.body.email).toBe('test@example.com');
  });
  it('/api/users/:userId (GET) should retrieve a user', async () => {
    const createdUser = new userModel({
      name: 'Test User',
      email: 'test@example.com',
    });
    await createdUser.save();
    const response = await request(app.getHttpServer())
      .get(`/api/users/${createdUser._id}`)
      .expect(200);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe('Test User');
    expect(response.body.email).toBe('test@example.com');
  });
  it('/api/users/:userId/avatar (GET) should retrieve user avatar', async () => {
    const createdUser = new userModel({
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://reqres.in/img/faces/1-image.jpg',
    });
    await createdUser.save();
    const response = await request(app.getHttpServer())
      .get(`/api/users/${createdUser._id}/avatar`)
      .expect(200);
    expect(response.text).toBeTruthy();
  });
  it('/api/users/:userId/avatar (DELETE) should delete user avatar', async () => {
    const createdUser = new userModel({
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://reqres.in/img/faces/1-image.jpg',
      avatarHash: 'abc123',
    });
    await createdUser.save();
    await request(app.getHttpServer())
      .delete(`/api/users/${createdUser._id}/avatar`)
      .expect(200);
    const user = await userModel.findById(createdUser._id).exec();
    expect(user.avatar).toBeNull();
    expect(user.avatarHash).toBeNull();
  });
});
