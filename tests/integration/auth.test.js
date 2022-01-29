import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import request from 'supertest';

import { User } from '@models';

import { validUserObject1 } from '../constants';
import { registerUser, loginUser } from '../functions';

describe('Auth routes (/auth)', () => {
	const server = require('../../src/server');

	afterAll(async () => {
		await server.close();
		await mongoose.connection.close();
	});

	describe('Login with email and password (post /login)', () => {
		beforeEach(async () => {
			await User.deleteMany({});
		});

		it('should respond with 200 for correct credentials', async () => {
			await registerUser(server, validUserObject1);
			const { email, password } = validUserObject1;
			const loginResponse = await loginUser(server, { email, password });
			expect(loginResponse.statusCode).toBe(StatusCodes.OK);
		});

		it('should respond with 400 for incomplete credentials', async () => {
			await registerUser(server, validUserObject1);
			const { email } = validUserObject1;
			const loginResponse = await loginUser(server, { email });
			expect(loginResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
		});

		it('should respond with 400 for invalid credentials (validation)', async () => {
			await registerUser(server, validUserObject1);
			const { email } = validUserObject1;
			const loginResponse = await loginUser(server, { email, password: 'abcdefg' });
			expect(loginResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
		});

		it('should respond with 401 for wrong credentials', async () => {
			await registerUser(server, validUserObject1);
			const { email } = validUserObject1;
			const loginResponse = await loginUser(server, { email, password: 'AbcDef12!@' });
			expect(loginResponse.statusCode).toBe(StatusCodes.UNAUTHORIZED);
		});
	});

	describe('Check auth (get /check)', () => {
		const { email, password } = validUserObject1;
		let validToken;

		beforeAll(async () => {
			await User.deleteMany({});
			await registerUser(server, validUserObject1);
			validToken = (await loginUser(server, { email, password })).body.token;
		});

		const checkToken = token => {
			return request(server)
				.get('/auth/check')
				.set('Authorization', 'Bearer ' + token);
		};

		it('should respond with 200 if a valid token is set', async () => {
			const result = await checkToken(validToken);
			expect(result.statusCode).toEqual(StatusCodes.OK);
		});

		it('should respond with 401 for tampered token', async () => {
			const result = await checkToken(validToken.replace(/f/g, 'a'));
			expect(result.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
		});

		it('should respond with 401 if no auth header is set', async () => {
			expect((await request(server).get('/auth/check')).statusCode).toEqual(401);
		});
	});
});
