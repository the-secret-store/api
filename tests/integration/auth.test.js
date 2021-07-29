import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { User } from '@models';
import { validUserObject1 } from '../constants/user.constant';

describe('Auth routes', () => {
	describe('Login with email and password', () => {
		const server = require('../../src/server');
		beforeEach(async () => {
			await User.deleteMany({});
		});
		afterEach(async () => {
			await server.close();
		});

		const registerUser = async payload => {
			return await request(server).post('/user/register').send(payload);
		};

		const loginUser = async credentials => {
			return await request(server).post('/auth/login').send(credentials);
		};

		it('should respond with 200 for correct credentials', async () => {
			await registerUser(validUserObject1);
			const { email, password } = validUserObject1;
			const loginResponse = await loginUser({ email, password });
			expect(loginResponse.statusCode).toBe(StatusCodes.OK);
		});

		it('should respond with 400 for incomplete credentials', async () => {
			await registerUser(validUserObject1);
			const { email } = validUserObject1;
			const loginResponse = await loginUser({ email });
			expect(loginResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
		});

		it('should respond with 400 for invalid credentials (validation)', async () => {
			await registerUser(validUserObject1);
			const { email } = validUserObject1;
			const loginResponse = await loginUser({ email, password: 'abcdefg' });
			expect(loginResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
		});

		it('should respond with 401 for wrong credentials', async () => {
			await registerUser(validUserObject1);
			const { email } = validUserObject1;
			const loginResponse = await loginUser({ email, password: 'AbcDef12!@' });
			expect(loginResponse.statusCode).toBe(StatusCodes.UNAUTHORIZED);
		});
	});
});
