require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token;

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns animals', async () => {

      const expectation = [
        {
          id: 1,
          make: 'Toyota',
          model: 'Tundra',
          desire_level: 10,
          affordability: false,
          owner_id: 1
        },
        {
          id: 2,
          make: 'Chevrolet',
          model: 'S10',
          desire_level: 1,
          affordability: true,
          owner_id: 1
        },
        {
          id: 3,
          make: 'Ford',
          model: 'F150',
          desire_level: 8,
          affordability: true,
          owner_id: 1
        },
        {
          id: 4,
          make: 'Dodge',
          model: 'Ram',
          desire_level: 8,
          affordability: false,
          owner_id: 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/trucks')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    test('returns a single truck', async () => {
      const expectation = {
        id: 1,
        make: 'Toyota',
        model: 'Tundra',
        desire_level: 10,
        affordability: false,
        owner_id: 1,

      };

      const data = await fakeRequest(app)
        .get('/trucks/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

  });
});
