import { StatusCodes } from 'http-status-codes';

/**
 * Controllers for all /ping routes
 *
 * Available controllers: testPing
 */

/**
 * Ping the server
 * @returns Status `200`
 */
export function testPing(_req, res) {
	res.sendStatus(StatusCodes.OK);
}

export default { testPing };
