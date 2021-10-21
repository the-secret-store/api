require('dotenv/config');

/**
 * These values will be loaded from '.env' file
 * refer docs: https://github.com/lorenwest/node-config/wiki/Environment-Variables
 * these values will be loaded from other configs if env is not set
 *
 * logRequests can be exposed from env to make it easier to troubleshoot in production
 */

module.exports = {
	host: 'HOST',
	port: 'PORT',
	jwtAuthSecret: 'JWT_AUTH_SECRET',
	jwtRefreshSecret: 'JWT_REFRESH_SECRET',
	authExpiry: 'AUTH_EXPIRY',
	refreshExpiry: 'REFRESH_EXPIRY',
	logRequests: 'VERBOSE_REQ_LOGGING',
	smtp_email: 'SMTP_EMAIL',
	smtp_password: 'SMTP_PASSWORD'
};
