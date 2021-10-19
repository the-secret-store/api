import 'express-async-errors';

import {
	AuthRouter,
	InvitationRouter,
	ProjectRouter,
	TeamRouter,
	UserRouter,
	VerificationRouter
} from '@routers';

/**
 * Registers all routes and handles server errors.
 */

export default function registerRouters(app) {
	app.use('/auth', AuthRouter);
	app.use('/invitation', InvitationRouter);
	app.use('/project', ProjectRouter);
	app.use('/team', TeamRouter);
	app.use('/user', UserRouter);
	app.use('/verify', VerificationRouter);
}
