import config from 'config';
import winston from 'winston';
import chalk from 'chalk';
import { requestLogger } from '@middlewares';

const { format, transports } = winston;
const { combine, colorize, printf, json, prettyPrint, timestamp } = format;

/**
 * Configures morgan request logging and adds the middleware.
 */

export function registerLogging(app) {
	if (config.get('logRequests')) app.use(requestLogger);
}

/**
 * A customized console transport
 */
const prettyConsoleTransport = new transports.Console({
	format: combine(
		colorize(),
		json(),
		timestamp({ format: 'DD/MM/YYYY h:mm:ss A' }),
		printf(info => {
			const { level, message, timestamp } = info;
			return `[${timestamp}] ${level} | ${message} ${
				level.includes('error') ? chalk.greenBright('\n\t - Stack trace ends here - \n') : ''
			}`;
		})
	)
});

/**
 * Creates file transport
 * @param {string} filename filepath to log
 * @param {string} level Logging level
 * @returns WinstonTransport
 */
const fileLogTransport = (filename, level) => {
	return new transports.File({
		filename,
		level,
		format: combine(json(), timestamp(), prettyPrint())
	});
};

/**
 * Get winston configs and transports based on environment
 * @param {string} environment
 * @returns {{transports: Array, exceptionHandlers: Array, rejectionHandlers: Array}}
 */
const getTransports = environment => {
	let winstonConfigs = {
		transports: [prettyConsoleTransport, fileLogTransport('logs/verbose.log', 'verbose')],
		exceptionHandlers: [prettyConsoleTransport, fileLogTransport('logs/exceptions.log', 'error')],
		rejectionHandlers: [prettyConsoleTransport, fileLogTransport('logs/rejections.log', 'warn')]
	};

	switch (environment) {
		case 'production':
			return winstonConfigs;

		case 'test':
			return {};

		case 'development':
		default:
			// pop out file transports, log only on console
			for (const configProp of Object.keys(winstonConfigs)) {
				winstonConfigs[configProp].pop();
			}
			return winstonConfigs;
	}
};

export default winston.createLogger({
	level: config.get('loggingLevel'),
	...getTransports(config.util.getEnv('NODE_ENV'))
});
