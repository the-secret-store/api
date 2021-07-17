import 'express-async-errors';
import { StatusCodes } from 'http-status-codes';
import { AuthRouter, PingRouter, UserRouter } from '@routers';

/**
 * Registers all routes and handles server errors.
 */

export default function registerRouters(app) {
	app.use('/auth', AuthRouter);
	app.use('/ping', PingRouter);
	app.use('/user', UserRouter);

	app.use((err, _req, res, next) => {
		res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.send('Something went wrong from our side. Please try again after some time.');

		next(err);
	});
}
