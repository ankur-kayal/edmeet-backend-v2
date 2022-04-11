import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    app.listen(5000);

    pactum.request.setBaseUrl('http://localhost:5000');
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
});
