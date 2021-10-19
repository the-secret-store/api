import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { OTP, Team, User } from '@models';

import {
	validObjectId,
	validTeam1,
	validUserObject1,
	validUserObject2,
	validUserObject3
} from '../constants';
import {
	acceptInvitation,
	createTeam,
	fullVerify,
	getOTP,
	inviteToTeam,
	loginUser,
	registerUser,
	verifyUser
} from '../functions';

describe('Team routes (/team)', () => {
	const server = require('../../src/server');
	let token1, token2;
	let user1;
	let teamId, invitationId;

	beforeAll(async () => {
		await User.deleteMany();

		// create a new account and login
		await registerUser(server, { ...validUserObject1 });
		token1 = (
			await loginUser(server, {
				email: validUserObject1.email,
				password: validUserObject1.password
			})
		).body.token;

		// verify the account and get it setup
		const { otp } = (await getOTP(server, token1)).body;
		await verifyUser(server, token1, otp);

		// login again and fetch verified token
		token1 = (
			await loginUser(server, {
				email: validUserObject1.email,
				password: validUserObject1.password
			})
		).body.token;

		user1 = jwt.decode(token1).id;

		// setting up an unverified account
		await registerUser(server, { ...validUserObject2 });
		token2 = (
			await loginUser(server, {
				email: validUserObject2.email,
				password: validUserObject2.password
			})
		).body.token;

		OTP.deleteMany();
	});

	afterAll(async () => {
		await Team.deleteMany({});
		await server.close();
		await mongoose.connection.close();
	});

	describe('create team (post /create)', () => {
		it('should throw 401 if auth is not set', async () => {
			const res = await createTeam(server, undefined, validTeam1(user1));
			expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
		});

		it('should throw 403 if account is unverified', async () => {
			const res = await createTeam(server, token2, validTeam1(user1));
			expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
		});

		it('should throw 400 if body is not set', async () => {
			const res = await createTeam(server, token1, undefined);
			expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
		});

		it('should respond 201 if details are valid', async () => {
			const res = await createTeam(server, token1, validTeam1(user1));
			expect(res.statusCode).toBe(StatusCodes.CREATED);
			teamId = res.body.data._id;
		});

		it('should respond 409 if the team already exist', async () => {
			const res = await createTeam(server, token1, validTeam1(user1));
			expect(res.statusCode).toBe(StatusCodes.CONFLICT);
		});
	});

	describe('invite a member (post /:id/invite)', () => {
		it('should throw 401 if auth is not set', async () => {
			const res = await inviteToTeam(server, null, teamId, validUserObject2.email);
			expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
		});

		it('should throw 403 if sent by non-privileged', async () => {
			const res = await inviteToTeam(server, token2, teamId, validUserObject3.email);
			expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
		});

		it('should throw 404 if team does not exist', async () => {
			const res = await inviteToTeam(server, token1, validObjectId, validUserObject2.email);
			teamId;
			expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
		});

		it('should respond 201 for a valid invite', async () => {
			const res = await inviteToTeam(server, token1, teamId, validUserObject2.email);
			expect(res.statusCode).toBe(StatusCodes.CREATED);
			invitationId = res.body.data.invitationId;
		});

		it('should respond 400 if user is already invited', async () => {
			//already invited in previous test
			const res = await inviteToTeam(server, token1, teamId, validUserObject2.email);
			expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
		});

		it('should respond 400 if user is already a member', async () => {
			token2 = await fullVerify(server, token2, validUserObject2.email, validUserObject2.password);
			await acceptInvitation(server, token2, invitationId);
			const res = await inviteToTeam(server, token1, teamId, validUserObject2.email);
			expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
			expect(res.body.message).toBe('User is already a member of the team');
		});

		it('should respond 403 if non-admins invite', async () => {
			const res = await inviteToTeam(server, token2, teamId, validUserObject3.email);
			expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
		});
	});
});
