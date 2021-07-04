import mongoose from 'mongoose';
import config from 'config';
import chalk from 'chalk';
import logger from '@tools/logging';

export default async function connectDB() {
	const DB_URI = config.get('db_uri');
	const options = {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false
	};

	try {
		logger.info(`Connecting to DB at ${chalk.cyan(DB_URI)}`);
		await mongoose.connect(DB_URI, options);
		logger.info(`DB connection ${chalk.greenBright('successful')}`);
	} catch (exp) {
		logger.info(`DB connection ${chalk.red('failed')}`);
		throw exp;
	}
}
