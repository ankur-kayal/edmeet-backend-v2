import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe.skip('Feeds (e2e)', () => {
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

  describe('create feed', () => {
    it('should throw error if roomId is not defined', () => {
      return pactum
        .spec()
        .post('/graphql')
        .withGraphQLQuery(
          `mutation CreateFeed($createFeedInput: CreateFeedInput!){
              createFeed(createFeedInput: $createFeedInput) {
                id
                roomId
                text
                createdAt
                updatedAt
              }
            }`,
        )
        .withGraphQLVariables({
          createRoomInput: {
            text: 'Test Feed',
          },
        })
        .expectStatus(400);
    });
    it('should throw error if roomId is not valid mongodb id', () => {
      return pactum
        .spec()
        .post('/graphql')
        .withGraphQLQuery(
          `mutation CreateFeed($createFeedInput: CreateFeedInput!) {
              createFeed(createFeedInput: $createFeedInput) {
                createdAt
                id
                roomId
                text
                updatedAt
              }
            }`,
        )
        .withGraphQLVariables({
          createFeedInput: {
            text: 'Test Feed',
            roomId: 'invalid-room-id',
          },
        })
        .expectJsonLike({
          errors: [
            {
              message: 'roomId should be a valid MongoDB ObjectId',
              extensions: {
                code: 'BAD_USER_INPUT',
                response: {
                  statusCode: 400,
                  message: 'roomId should be a valid MongoDB ObjectId',
                  error: 'Bad Request',
                },
              },
            },
          ],
        });
    });
    it('should throw error if no room with roomId exists', () => {
      return pactum
        .spec()
        .post('/graphql')
        .withGraphQLQuery(
          `mutation CreateFeed($createFeedInput: CreateFeedInput!) {
              createFeed(createFeedInput: $createFeedInput) {
                createdAt
                id
                roomId
                text
                updatedAt
              }
            }`,
        )
        .withGraphQLVariables({
          createFeedInput: {
            text: 'Test Feed',
            roomId: '627d512ad171b687f4e07ff7',
          },
        })
        .expectJsonLike({
          errors: [
            {
              message:
                'room with roomId 627d512ad171b687f4e07ff7 does not exist!',
              extensions: {
                code: 'BAD_USER_INPUT',
                response: {
                  statusCode: 400,
                  message:
                    'room with roomId 627d512ad171b687f4e07ff7 does not exist!',
                  error: 'Bad Request',
                },
              },
            },
          ],
        });
    });
    it('should throw error if text is empty', () => {
      return pactum
        .spec()
        .post('/graphql')
        .withGraphQLQuery(
          `mutation CreateFeed($createFeedInput: CreateFeedInput!) {
              createFeed(createFeedInput: $createFeedInput) {
                createdAt
                id
                roomId
                text
                updatedAt
              }
            }`,
        )
        .withGraphQLVariables({
          createFeedInput: {
            roomId: '627d512ad171b687f4e07ff7',
            text: '',
          },
        })
        .expectJsonLike({
          errors: [
            {
              message: 'Bad Request Exception',
              extensions: {
                code: 'BAD_USER_INPUT',
                response: {
                  statusCode: 400,
                  message: ['Feed text cannot be empty!'],
                  error: 'Bad Request',
                },
              },
            },
          ],
        });
    });
    it.todo('should create feed');
  });

  describe('find all feed', () => {
    it.todo('should return all feeds');
  });

  describe('find a feed', () => {
    it.todo('should throw error if id is not defined');
    it.todo('should throw error if id is not valid mongodb id');
    it.todo('should throw error if no feed with id exists');
    it.todo('should return a feed');
  });

  describe('update a feed', () => {
    it.todo('should throw error if updated text is empty');
    it.todo('should throw error if id is not defined');
    it.todo('should throw error if id is not a valid mongodb id');
    it.todo('should throw error if no feed with id exists');
    it.todo('should update the feed');
  });

  describe('delete a feed', () => {
    it.todo('should throw error if id is not defined');
    it.todo('should throw error if is not a valid mongodb id');
    it.todo('should throw error if no feed with id exists');
    it.todo('should delete feed');
  });
});
