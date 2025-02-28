/* eslint-disable import/no-extraneous-dependencies */
import { prisma } from '@infra/database/prisma';
import { app } from '@infra/http/app';
import request from 'supertest';

import { faker } from '@faker-js/faker/.';
import { City } from '@prisma/client';

let city: City;

describe('ListCustomerController', () => {
  afterAll(async () => {
    const deleteAllCustomers = prisma.customer.deleteMany();
    const deleteAllCities = prisma.city.deleteMany();

    await prisma.$transaction([deleteAllCustomers, deleteAllCities]);

    await prisma.$disconnect();
  });

  beforeEach(async () => {
    city = await prisma.city.create({
      data: {
        country: faker.location.country(),
        name: faker.location.city(),
      },
    });
  });

  it('should be able to list registered customers!', async () => {
    const customerRegistereds = [];

    for (let i = 0; i < 5; i += 1) {
      customerRegistereds.push({
        birth_date: faker.date.past(),
        full_name: faker.person.fullName(),
        genre: faker.helpers.arrayElement(['MALE', 'FEMALE']),
        city_id: city.id,
      });
    }

    await prisma.customer.createMany({
      data: customerRegistereds,
    });

    /**
     * Test Case
     */

    const response = await request(app).get('/api/customers');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(5);

    const [first] = response.body;

    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('full_name');
    expect(first).toHaveProperty('birth_date');
    expect(first).toHaveProperty('genre');
    expect(first).toHaveProperty('city');
    expect(first).toHaveProperty('age');
    expect(first).toHaveProperty('is_active');
  });

  it('should be able to list all customer that match the name filter!', async () => {
    await prisma.customer.createMany({
      data: [
        {
          birth_date: new Date('10-14-1995'),
          full_name: 'Mateus Pinto Garcia',
          genre: 'MALE',
          city_id: city.id,
        },
        {
          birth_date: new Date('10-14-1995'),
          full_name: 'Ana Maria Garcia',
          genre: 'FEMALE',
          city_id: city.id,
        },
      ],
    });

    const response = await request(app).get('/api/customers').query({
      name: 'Mateus',
    });

    const response2 = await request(app).get('/api/customers').query({
      name: 'Garcia',
    });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(1);

    const [first] = response.body;

    expect(first.age).toEqual(new Date().getFullYear() - 1995);
    expect(first.full_name).toEqual('Mateus Pinto Garcia');
    expect(first.genre).toEqual('MALE');

    /**
     * Second Response query
     */

    expect(response2.status).toBe(200);
    expect(response2.body).toBeInstanceOf(Array);
    expect(response2.body).toHaveLength(2);
  });
});
