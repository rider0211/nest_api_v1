import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoModule } from './mongo/mongo.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/payever_backend_test'),
    MongoModule,
    HttpModule,
    RabbitMQModule,
    UsersModule,
  ],
})
export class AppModule {}
