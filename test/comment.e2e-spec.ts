import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe.skip('Comments (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    app.listen(5000);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:5000');
  });

  afterAll(() => {
    app.close();
  });

  describe('createComment', () => {
    it.todo('should throw error if comment text is empty');
    it.todo('should throw error if roomId undefined');
    it.todo('should throw error if feedId is undefined');
    it.todo('should throw error if roomId is not valid mongodb id');
    it.todo('should throw error if feedId is not valid mongodb id');
    it.todo('should throw error if no room with roomId exists');
    it.todo(
      'should throw error if no feed with feedId related to room with roomId exists',
    );
    it.todo('should create comment');
  });
  describe('comments', () => {
    it.todo('should return all comments');
  });
  describe('comment', () => {
    it.todo('should throw error if id is not defined');
    it.todo('should throw error if id is not valid mongodb id');
    it.todo('should throw error if no comment with id exists in the database');
    it.todo('should get comment');
  });
  describe('updateComment', () => {
    it.todo('should throw error if id is undefined');
    it.todo('should throw error if updated text is expty');
    it.todo('should throw error if id is not valid mongodb id');
    it.todo('should throw error if no comment with id exists');
    it.todo('should return updated comment');
  });
  describe('deleteComment', () => {
    it.todo('should throw error if id is undefined');
    it.todo('should throw error if id is not valid mongodb id');
    it.todo('should throw error if no comment with id exists');
    it.todo('should delete comment');
  });
});
