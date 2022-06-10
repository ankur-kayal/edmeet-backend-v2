import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from './../src/app.module';
import { CreateRoomInput } from '../src/room/dto/create-room.input';
import { UpdateRoomInput } from '../src/room/dto/update-room.input';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Rooms (e2e)', () => {
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
