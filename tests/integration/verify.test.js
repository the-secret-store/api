import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { OTP, User } from '@models';

import { validUserObject1 } from '../constants';
import { getOTP, loginUser, registerUser, verifyUser } from '../functions';

describe('Verification routes (/verify)', () => {
	const server = require('../../src/server');
	let token = null;
	let otp;

	beforeAll(async () => {
		await User.deleteMany();
		await registerUser(server, validUserObject1);

		const res = await loginUser(server, {
			email: validUserObject1.email,
			password: validUserObject1.password
		});

		token = res.body.token;
	});

	afterAll(async () => {
		await OTP.deleteMany();
		await server.close();
		await mongoose.connection.close();
	});

	it('should be unverified for new accounts', async () => {
		const payload = jwt.decode(token);
		expect(payload.unverified).toBeTruthy();
	});

	describe('Get OTP (get /get-otp)', () => {
		it('should respond 401 without auth header', async () => {
			const res = await getOTP(server);
			expect(res.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
		});

		it('should send OTP and respond 200', async () => {
			const res = await getOTP(server, token);
			expect(res.statusCode).toEqual(StatusCodes.OK);
			expect(res.body).toHaveProperty('otp');
			otp = res.body.otp;
		});
	});

	describe('Verify account (post /check)', () => {
		it('should respond 401 w/o auth header', async () => {
			const res = await verifyUser(server, undefined, otp);
			expect(res.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
		});

		it('should respond 400 w/o otp', async () => {
			const res = await verifyUser(server, token);
			expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
		});

		it('should respond 400 for wrong OTP', async () => {
			const res = await verifyUser(server, token, otp - 1);
			expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
		});

		it('should respond 200 for right i/p', async () => {
			const res = await verifyUser(server, token, otp);
			expect(res.statusCode).toEqual(StatusCodes.OK);
		});

		it('check if account is verified', async () => {
			const res = await loginUser(server, {
				email: validUserObject1.email,
				password: validUserObject1.password
			});
			token = res.body.token;
			const payload = jwt.decode(token);

			expect(payload.unverified).toBeFalsy();
		});
	});
});
