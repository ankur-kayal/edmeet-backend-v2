import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from './../src/app.module';
import { CreateRoomInput } from '../src/room/dto/create-room.input';
import { UpdateRoomInput } from '../src/room/dto/update-room.input';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    app.listen(5050);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:5050');
  });

  afterAll(() => {
    app.close();
  });

  it('/ (GET)', async () => {
    return pactum
      .spec()
      .get('/')
      .expectStatus(HttpStatus.OK)
      .expectBody('Welcome to Edmeet API!');
  });

  describe('Room', () => {
    const createRoomInput: CreateRoomInput = {
      code: 'CSEN1242',
      name: 'Test Room',
      description: 'Test desription',
      photo: 'test-photo.jpg',
    };

    describe('createRoom resolver', () => {
      it('should throw bad request all fields is missing', () => {
        return pactum
          .spec()
          .post('/graphql')
          .withGraphQLQuery(
            `mutation CreateRoom($createRoomInput: CreateRoomInput!) {
                createRoom(createRoomInput: $createRoomInput) {
                  code
                  createdAt
                  description
                  id
                  name
                  updatedAt
                  photo
                }
              }`,
          )
          .withGraphQLVariables({
            createRoomInput: {},
          })
          .expectStatus(400);
      });
      it('should throw bad request if code field is missing', () => {
        return pactum
          .spec()
          .post('/graphql')
          .withGraphQLQuery(
            `mutation CreateRoom($createRoomInput: CreateRoomInput!) {
                createRoom(createRoomInput: $createRoomInput) {
                  code
                  createdAt
                  description
                  id
                  name
                  updatedAt
                  photo
                }
              }`,
          )
          .withGraphQLVariables({
            createRoomInput: {
              name: createRoomInput.name,
            },
          })
          .expectStatus(400);
      });
      it('should throw bad request if name field is missing', () => {
        return pactum
          .spec()
          .post('/graphql')
          .withGraphQLQuery(
            `mutation CreateRoom($createRoomInput: CreateRoomInput!) {
                createRoom(createRoomInput: $createRoomInput) {
                  code
                  createdAt
                  description
                  id
                  name
                  updatedAt
                  photo
                }
              }`,
          )
          .withGraphQLVariables({
            createRoomInput: {
              code: createRoomInput.code,
            },
          })
          .expectStatus(400);
      });
      it('should create room if photo and desc is missing', () => {
        return pactum
          .spec()
          .post('/graphql')
          .withGraphQLQuery(
            `mutation CreateRoom($createRoomInput: CreateRoomInput!) {
                createRoom(createRoomInput: $createRoomInput) {
                  code
                  createdAt
                  description
                  id
                  name
                  updatedAt
                  photo
                }
              }`,
          )
          .withGraphQLVariables({
            createRoomInput: {
              name: createRoomInput.name,
              code: createRoomInput.code,
            },
          })
          .expectStatus(200);
      });
      it('should create room', () => {
        return pactum
          .spec()
          .post('/graphql')
          .withGraphQLQuery(
            `mutation CreateRoom($createRoomInput: CreateRoomInput!) {
                createRoom(createRoomInput: $createRoomInput) {
                  code
                  createdAt
                  description
                  id
                  name
                  updatedAt
                  photo
                }
              }`,
          )
          .withGraphQLVariables({
            createRoomInput,
          })
          .expectStatus(200)
          .stores('room', 'data.createRoom');
      });
    });

    describe('room findAll resolver', () => {
      it('should return rooms', () => {
        return pactum
          .spec()
          .post('/graphql')
          .withGraphQLQuery(
            `query Rooms {
              rooms {
                code
                createdAt
                description
                id
                name
                photo
                updatedAt
              }
            }`,
          )
          .expectStatus(200)
          .expectJsonLike({
            data: {
              rooms: ['$S{room}'],
            },
          });
      });
    });

    describe('room findOne resolver', () => {
      const dummyRoomId = '6011492b5c9bfa013875e2d6';

      it('should throw error if room id is not valid mongodb ID in findOne', () => {
        return pactum
          .spec()
          .post('/graphql')
          .withGraphQLQuery(
            `query Room($roomId: String!) {
              room(id: $roomId) {
                code
                createdAt
                description
                id
                name
                photo
                updatedAt
              }
            }`,
          )
          .withGraphQLVariables({
            roomId: '43875439',
          })
          .expectJsonLike({
            errors: [
              {
                message: 'id should be a valid MongoDB ObjectId',
                extensions: {
                  code: 'BAD_USER_INPUT',
                  response: {
                    statusCode: 400,
                  },
                },
              },
            ],
          });
      });
      it('should throw not found exception if room with roomId does not exist', () => {
        return pactum
          .spec()
          .post('/graphql')
          .withGraphQLQuery(
            `query Room($roomId: String!) {
              room(id: $roomId) {
                code
                createdAt
                description
                id
                name
                photo
                updatedAt
              }
            }`,
          )
          .withGraphQLVariables({
            roomId: dummyRoomId,
          })
          .expectJsonLike({
            errors: [
              {
                message: `Room with id: ${dummyRoomId} not found`,
                extensions: {
                  code: '404',
                  response: {
                    statusCode: 404,
                  },
                },
              },
            ],
          });
      });

      it('should return the inserted room', () => {
        return pactum
          .spec()
          .post('/graphql')
          .withGraphQLQuery(
            `query Room($roomId: String!) {
              room(id: $roomId) {
                code
                createdAt
                description
                id
                name
                photo
                updatedAt
              }
            }`,
          )
          .withGraphQLVariables({
            roomId: '$S{room.id}',
          })
          .expectJsonLike({
            data: {
              room: '$S{room}',
            },
          });
      });
    });

    describe('updateRoom resolver', () => {
      const dummyRoomId = '6011492b5c9bfa013875e2d6';

      const updateRoomInput: UpdateRoomInput = {
        id: '$S{room.id}',
        code: 'CSEN3298',
        description: 'Updated description',
        name: 'Updated room name',
        photo: 'updated-photo.jpg',
      };

      it('should throw error if room id is not mongodb ID in findOne', () => {
        return pactum
          .spec()
          .post('/graphql')
          .withGraphQLQuery(
            `mutation Mutation($updateRoomInput: UpdateRoomInput!) {
              updateRoom(updateRoomInput: $updateRoomInput) {
                id
              }
            }`,
          )
          .withGraphQLVariables({
            updateRoomInput: {
              id: '493702',
            },
          })
          .expectJsonLike({
            errors: [
              {
                message: 'id should be a valid MongoDB ObjectId',
                extensions: {
                  code: 'BAD_USER_INPUT',
                  response: {
                    statusCode: 400,
                  },
                },
              },
            ],
          });
      });

      it('should throw not found exception if room with roomId does not exist', () => {
        return pactum
          .spec()
          .post('/graphql')
          .withGraphQLQuery(
            `mutation Mutation($updateRoomInput: UpdateRoomInput!) {
              updateRoom(updateRoomInput: $updateRoomInput) {
                code
                createdAt
                description
                id
                name
                photo
                updatedAt
              }
            }`,
          )
          .withGraphQLVariables({
            updateRoomInput: {
              id: dummyRoomId,
            },
          })
          .expectJsonLike({
            errors: [
              {
                message: `Room with id: ${dummyRoomId} not found`,
                extensions: {
                  code: '404',
                  response: {
                    statusCode: 404,
                  },
                },
              },
            ],
          });
      });

      it('should return the updated room', () => {
        return pactum
          .spec()
          .post('/graphql')
          .withGraphQLQuery(
            `mutation Mutation($updateRoomInput: UpdateRoomInput!) {
              updateRoom(updateRoomInput: $updateRoomInput) {
                code
                createdAt
                description
                id
                name
                photo
                updatedAt
              }
            }`,
          )
          .withGraphQLVariables({
            updateRoomInput: {
              ...updateRoomInput,
              id: '$S{room.id}',
            },
          })
          .expectJsonLike({
            data: {
              updateRoom: updateRoomInput,
            },
          });
      });
    });

    describe('removeRoom resolver', () => {
      const dummyRoomId = '6011492b5c9bfa013875e2d6';

      it('should throw error if room id is not mongodb ID in findOne', () => {
        return pactum
          .spec()
          .post('/graphql')
          .withGraphQLQuery(
            `mutation Mutation($roomId: String!) {
              removeRoom(id: $roomId)
            }`,
          )
          .withGraphQLVariables({
            roomId: '43875439',
          })
          .expectJsonLike({
            errors: [
              {
                message: 'id should be a valid MongoDB ObjectId',
                extensions: {
                  code: 'BAD_USER_INPUT',
                  response: {
                    statusCode: 400,
                  },
                },
              },
            ],
          });
      });

      it('should throw not found exception if room with roomId does not exist', () => {
        return pactum
          .spec()
          .post('/graphql')
          .withGraphQLQuery(
            `mutation Mutation($roomId: String!) {
            removeRoom(id: $roomId)
          }`,
          )
          .withGraphQLVariables({
            roomId: dummyRoomId,
          })
          .expectJsonLike({
            errors: [
              {
                message: `Room with id: ${dummyRoomId} not found`,
                extensions: {
                  code: '404',
                  response: {
                    statusCode: 404,
                  },
                },
              },
            ],
          });
      });

      it('should delete the room', () => {
        return pactum
          .spec()
          .post('/graphql')
          .withGraphQLQuery(
            `mutation Mutation($roomId: String!) {
              removeRoom(id: $roomId)
            }`,
          )
          .withGraphQLVariables({
            roomId: '$S{room.id}',
          })
          .expectJsonLike({
            data: {
              removeRoom: 'Room with roomId: $S{room.id} deleted successfully',
            },
          });
      });
    });
  });

  describe('Feed', () => {
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

  describe('Comment', () => {
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
      it.todo(
        'should throw error if no comment with id exists in the database',
      );
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
});
