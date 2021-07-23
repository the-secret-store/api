import { createTransport } from 'nodemailer';
import config from 'config';
import chalk from 'chalk';
import logger from '@tools/logging';

const transport = createTransport({
	host: 'smtp.mailgun.org',
	port: 587,
	auth: {
		user: config.get('smtp_email'),
		pass: config.get('smtp_password')
	}
});

export default transport;

export async function verifyMailConnection() {
	try {
		await transport.verify();
		logger.info(`Connection to mail server ${chalk.greenBright('successful')}`);
	} catch (exp) {
		logger.info(`Connection to mail server ${chalk.red('failed')}`);
		logger.error(exp.stack);
		process.exit(1);
	}
}