import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { User, Project, OTP } from '@models';

import { validUserObject1, validUserObject2, validProject1, validTeam1 } from '../constants';
import {
	getOTP,
	loginUser,
	registerUser,
	verifyUser,
	createProject,
	postSecrets,
	fetchSecrets,
	createTeam,
	fullVerify,
	inviteToTeam,
	acceptInvitation
} from '../functions';

describe('Project routes (/project)', () => {
	const server = require('../../src/server');
	let token1, token2, token3;
	let user1, user2;
	let projectId, appId;

	const secretsW2 = {
		secret: 'this-is-a-secret',
		secret2: 'this-is-also-a-secret'
	};

	const secretsW1 = {
		secret: 'this-is-a-secret'
	};

	beforeAll(async () => {
		await User.deleteMany();

		// create a new account and login
		await registerUser(server, validUserObject1);
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
		await registerUser(server, validUserObject2);
		token2 = (
			await loginUser(server, {
				email: validUserObject2.email,
				password: validUserObject2.password
			})
		).body.token;
		user2 = jwt.decode(token2).id;

		OTP.deleteMany();
	});

	afterAll(async () => {
		await Project.deleteMany({});
		await server.close();
		await mongoose.connection.close();
	});

	describe('create new project (post /create)', () => {
		it('should respond 401 if auth not set', async () => {
			const res = await createProject(server, undefined, validProject1(user1));
			expect(res.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
		});

		it('should respond 403 if account is unverified', async () => {
			const res = await createProject(server, token2, validProject1(user2));
			expect(res.statusCode).toEqual(StatusCodes.FORBIDDEN);
		});

		it('should respond 400 if details are not set', async () => {
			const res = await createProject(server, token1);
			expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
		});

		it('should respond 200 if details are valid', async () => {
			const res = await createProject(server, token1, validProject1(user1));
			expect(res.statusCode).toEqual(StatusCodes.CREATED);
			projectId = res.body.data.id;
			appId = res.body.data.app_id;
		});

		it('should respond 409 if project already exist', async () => {
			const res = await createProject(server, token1, validProject1(user1));
			expect(res.statusCode).toEqual(StatusCodes.CONFLICT);
		});
	});

	describe('post secrets (post /:id/post)', () => {
		it('should throw 401 if the user is not logged in', async () => {
			// user 2 is not verified & is not a does not have access to the project
			const res = await postSecrets(server, undefined, appId, {});
			expect(res.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
		});

		it('should throw 403 if the user is not verified', async () => {
			// user 2 is not verified & is not a does not have access to the project
			const res = await postSecrets(server, token2, appId, {});
			expect(res.statusCode).toEqual(StatusCodes.FORBIDDEN);
		});

		it('should throw 403 if the user is not privileged', async () => {
			// verify the account and get it setup
			const { otp } = (await getOTP(server, token2)).body;
			await verifyUser(server, token2, otp);

			// login again and fetch verified token
			token3 = (
				await loginUser(server, {
					email: validUserObject2.email,
					password: validUserObject2.password
				})
			).body.token;

			const res = await postSecrets(server, token3, appId, {});
			expect(res.statusCode).toEqual(StatusCodes.FORBIDDEN);
		});

		it('should accept if the user privileged', async () => {
			const res = await postSecrets(server, token1, appId, secretsW1);
			expect(res.statusCode).toEqual(StatusCodes.OK);
		});

		it('should also work with projectId', async () => {
			const res = await postSecrets(server, token1, projectId, secretsW2);
			expect(res.statusCode).toEqual(StatusCodes.OK);
		});

		it('should have a backup of old secrets', async () => {
			const res = await postSecrets(server, token1, projectId, {
				secret: secretsW2.secret
			});
			expect(res.statusCode).toEqual(StatusCodes.OK);
			expect(res.body.data.backup).toHaveProperty('secret2', secretsW2.secret2);
		});

		it('should post secrets and send back the same', async () => {
			const res = await postSecrets(server, token1, projectId, secretsW2);
			expect(res.body.data).toHaveProperty('secrets', secretsW2);
		});
	});

	describe('fetch secrets (get /:id/fetch)', () => {
		it('should throw 401 if the user is not logged in', async () => {
			// user 2 is not verified & is not a does not have access to the project
			const res = await fetchSecrets(server, undefined, appId);
			expect(res.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
		});

		it('should throw 403 if the user is not verified', async () => {
			// user 2 is not verified & is not a does not have access to the project
			const res = await fetchSecrets(server, token2, appId);
			expect(res.statusCode).toEqual(StatusCodes.FORBIDDEN);
		});

		it('should throw 403 if the user is not privileged', async () => {
			const res = await fetchSecrets(server, token3, appId);
			expect(res.statusCode).toEqual(StatusCodes.FORBIDDEN);
		});

		it('should accept if the user privileged', async () => {
			const res = await fetchSecrets(server, token1, appId);
			expect(res.statusCode).toEqual(StatusCodes.OK);
			expect(res.body.data).toHaveProperty('secrets', secretsW2);
			expect(res.body.data).toHaveProperty('backup');
		});

		it('should also work with projectId', async () => {
			const res = await fetchSecrets(server, token1, projectId);
			expect(res.statusCode).toEqual(StatusCodes.OK);
			expect(res.body.data).toHaveProperty('secrets', secretsW2);
			expect(res.body.data).toHaveProperty('backup');
		});
	});

	describe('projects belonging to a team', () => {
		let teamId;
		let projectId, appId;
		let verifiedToken2;

		beforeAll(async () => {
			teamId = (await createTeam(server, token1, validTeam1(user1))).body.data._id;
			const resBody = (await createProject(server, token1, validProject1(teamId))).body;
			projectId = resBody.data.id;
			appId = resBody.data.app_id;
		});

		it('should respond 200 for both fetch and post from admin/owner', async () => {
			let res = await postSecrets(server, token1, projectId, { secret: 'this-is-a-secret' });
			expect(res.statusCode).toEqual(StatusCodes.OK);
			res = await fetchSecrets(server, token1, appId);
			expect(res.statusCode).toEqual(StatusCodes.OK);
		});

		it('should forbid users that does not belong to the team', async () => {
			let res = await fetchSecrets(server, token2, appId);
			expect(res.statusCode).toEqual(StatusCodes.FORBIDDEN);
			res = await postSecrets(server, token2, projectId, { secret2: 'this-is-also-secret' });
			expect(res.statusCode).toEqual(StatusCodes.FORBIDDEN);
		});

		async function joinNewMember() {
			verifiedToken2 = await fullVerify(
				server,
				token2,
				validUserObject2.email,
				validUserObject2.password
			);
			const { invitationId } = (await inviteToTeam(server, token1, teamId, validUserObject2.email))
				.body.data;
			await acceptInvitation(server, verifiedToken2, invitationId);
		}

		it('should allow non-admins to fetch', async () => {
			await joinNewMember();
			const res = await fetchSecrets(server, verifiedToken2, appId);
			expect(res.statusCode).toEqual(StatusCodes.OK);
		});

		// currently we allow members to post secrets
		/*
		it('should forbid non-admins from posting', async () => {
			const res = await postSecrets(server, verifiedToken2, appId, { test: 'test-secret' });
			expect(res.statusCode).toEqual(StatusCodes.FORBIDDEN);
		});
		*/
	});
});
