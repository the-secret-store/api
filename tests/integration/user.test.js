import request from 'supertest';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { User } from '@models';
import { validUserObject1 } from '../constants/user.constant';

describe('User router', () => {
	describe('Registration [POST /register]', () => {
		const server = require('../../src/server');
		beforeEach(async () => {
			await User.deleteMany({});
		});
		afterEach(async () => {
			await server.close();
		});

		afterAll(async () => {
			await mongoose.connection.close();
		});

		const registerUser = async userObject => {
			return await request(server).post('/user/register').send(userObject);
		};

		it('return 200 for valid user', async () => {
			const response = await registerUser(validUserObject1);
			expect(response.statusCode).toEqual(StatusCodes.OK);
		});

		it('return 400 for user validation error', async () => {
			const payload = { ...validUserObject1 };
			// we don't have to test for all the validations, since unit tests take care of that
			payload.name = 'X';

			const response = await registerUser(payload);
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
		});

		it('return 400 for invalid user structure', async () => {
			const payload = { ...validUserObject1 };
			delete payload.email;

			const response = await registerUser(payload);
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
		});

		it('should throw 400 for duplication', async () => {
			await registerUser(validUserObject1);

			const response = await registerUser(validUserObject1);
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
		});
	});
});
