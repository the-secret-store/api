import request from 'supertest';
import { User } from '@models';
import { validUserObject1 } from '../constants/user.constant';

describe('User router', () => {
	describe('Registration [POST /register]', () => {
		let server;
		beforeEach(() => {
			server = require('../../src/server');
		});
		afterEach(async () => {
			await User.deleteMany({});
			await server.close();
		});

		const exec = async payload => {
			return await request(server).post('/user/register').send(payload);
		};

		it('return 200 for valid user', async () => {
			const response = await exec(validUserObject1);
			expect(response.statusCode).toEqual(200);

			if (response.statusCode === 400) {
				console.log(response.body);
			}
		});

		it('return 400 for user validation error', async () => {
			const payload = { ...validUserObject1 };
			// we don't have to test for all the validations, since unit tests take care of that
			payload.name = 'X';

			const response = await exec(payload);
			expect(response.statusCode).toEqual(400);
		});

		it('return 400 for invalid user structure', async () => {
			const payload = { ...validUserObject1 };
			delete payload.email;

			const response = await exec(payload);
			expect(response.statusCode).toEqual(400);
		});

		it('should throw 400 for duplication', async () => {
			await exec(validUserObject1);

			const response = await exec(validUserObject1);
			expect(response.statusCode).toEqual(400);
		});
	});
});
