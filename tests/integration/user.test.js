import request from 'supertest';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { User } from '@models';
import { validUserObject1, validUserObject2 } from '../constants';

describe('User router (/user)', () => {
	const server = require('../../src/server');

	afterAll(async () => {
		await server.close();
		await mongoose.connection.close();
	});

	const registerUser = async userObject => {
		return await request(server).post('/user/register').send(userObject);
	};

	const loginUser = async credentials => {
		return await request(server).post('/auth/login').send(credentials);
	};

	describe('Registration (POST /register)', () => {
		beforeEach(async () => {
			await User.deleteMany({});
		});

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

		it('return 400 for missing properties', async () => {
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

	describe('Password change (POST /changePassword)', () => {
		const { email, password } = validUserObject1;
		let validToken;

		beforeAll(async () => {
			await registerUser(validUserObject1);
			validToken = (await loginUser({ email, password })).body.token;
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
				.post('/user/changePassword')
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
