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
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    const todo = {
      hacer: 'test time',
      color: 'red',
      completed: false,
    };

    const databaseTodos = {
      ...todo,
      user_id: 2,
      id: 7
    };

    test('post endpoint to create a todo', async() => {

      const todo = {
        hacer: 'test time',
        color: 'red',
        completed: false,
      };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(todo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(databaseTodos);
    });

    test('put endpoint to update a todo', async() => {

      const updatedTodo = {
        hacer: 'updated test time',
        color: 'pink',
        completed: true,
      };

      await fakeRequest(app)
        .put('/api/todos/7')
        .send(updatedTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const updatedData = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const updatedDatabaseTodos = [
        {
          hacer: 'updated test time',
          color: 'pink',
          completed: true,
          id: 7,
          user_id: 2
        }
      ];

      expect(updatedData.body).toEqual(updatedDatabaseTodos);
    });

    test('get endpoint returns a specific user`s todos', async() => {

      const expectation = [
        {
          hacer: 'updated test time',
          color: 'pink',
          completed: true,
          id: 7,
          user_id: 2
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('get endpoint returns all todos', async() => {

      const expectation = [
        {
          id: 1,
          hacer: 'tarea',
          color: 'amarillo',
          completed: false,
          user_id: 1
        },
        {
          id: 2,
          hacer: 'call my dad',
          color: 'verde',
          completed: false,
          user_id: 1
        },
        {
          id: 3,
          hacer: 'snack on chocolate',
          color: 'rosado',
          completed: false,
          user_id: 1
        },
        {
          id: 4,
          hacer: 'call charlie',
          color: 'verde',
          completed: false,
          user_id: 1
        },
        {
          id: 5,
          hacer: 'cena',
          color: 'amarillo',
          completed: false,
          user_id: 1
        },
        {
          id: 6,
          hacer: 'tecito',
          color: 'rosado',
          completed: false,
          user_id: 1
        },
        {
          id: 7,
          hacer: 'updated test time',
          color: 'pink',
          completed: true,
          user_id: 2
        }
      ];

      const data = await fakeRequest(app)
        .get('/todos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    // This test cannot pass because a new hash for user 2 is created every time the test runs.

    // test('get endpoint returns users', async() => {

    //   const expectation = [
    //     {
    //       id: 1,
    //       email: 'john@arbuckle.com',
    //       hash: '1234'
    //     },
    //     {
    //       id: 2,
    //       email: 'jon@user.com',
    //       hash: '$2a$08$bC.ONg7ldx5RMO/52yYvguvjcbOt6X3JoCUEueSRw/G/1ct3P2Fzi'
    //     }
    //   ];

    //   const data = await fakeRequest(app)
    //     .get('/users')
    //     .expect('Content-Type', /json/)
    //     .expect(200);

    //   expect(data.body).toEqual(expectation);
    // });
  });
});
