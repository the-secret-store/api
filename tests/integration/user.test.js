import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import request from 'supertest';

import { User } from '@models';

import { validUserObject1, validUserObject2 } from '../constants';
import { registerUser, loginUser } from '../functions';

describe('User router (/user)', () => {
	const server = require('../../src/server');

	afterAll(async () => {
		await server.close();
		await mongoose.connection.close();
	});

	describe('Registration (POST /register)', () => {
		beforeEach(async () => {
			await User.deleteMany({});
		});

		it('return 201 for valid user', async () => {
			const response = await registerUser(server, validUserObject1);
			expect(response.statusCode).toEqual(StatusCodes.CREATED);
		});

		it('return 400 for user validation error', async () => {
			const payload = { ...validUserObject1 };
			// we don't have to test for all the validations, since unit tests take care of that
			payload.name = 'X';

			const response = await registerUser(server, payload);
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
		});

		it('return 400 for missing properties', async () => {
			const payload = { ...validUserObject1 };
			delete payload.email;

			const response = await registerUser(server, payload);
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
		});

		it('should throw 400 for duplication', async () => {
			await registerUser(server, validUserObject1);

			const response = await registerUser(server, validUserObject1);
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
		});
	});

	describe('Password change (PUT /changePassword)', () => {
		const { email, password } = validUserObject1;
		let validToken;

		beforeAll(async () => {
			await registerUser(server, validUserObject1);
			validToken = (await loginUser(server, { email, password })).body.token;
		});

		/**
		 *
		 * @param {{
		 * currentPassword: string,
		 * newPassword: string,
		 * newPasswordConfirmation: string
		 * }} passwordChangeReqParams
		 * @returns
		 */
		const changePassword = (passwordChangeReqParams, authToken) => {
			return request(server)
				.put('/user/changePassword')
				.send(passwordChangeReqParams)
				.set('Authorization', 'Bearer ' + authToken);
		};

		const npPair = {
			currentPassword: validUserObject1.password,
			newPassword: 'Abcd12@#',
			newPasswordConfirmation: 'Abcd12@#'
		};

		it('should respond 401 when no token is not set', async () => {
			const response = await changePassword({ ...npPair });
			expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
		});

		it('should respond 401 for wrong password', async () => {
			const response = await changePassword(
				{
					...npPair,
					currentPassword: validUserObject2.password
				},
				validToken
			);
			expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
		});

		it('should respond with 200 for correct request', async () => {
			expect((await changePassword(npPair, validToken)).statusCode).toEqual(200);
		});
	});
});
