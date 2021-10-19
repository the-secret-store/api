import chalk from 'chalk';
import config from 'config';
import { name as appName, description, license, version } from 'package.json';
import swaggerUI from 'swagger-ui-express';

import docs from '@docs';
import tags from '@docs/tags';

import logger from './logging';

const documentObject = {
	swagger: '2.0',
	info: {
		title: appName,
		description,
		license: {
			name: license
		},
		version
	},
	paths: docs,
	tags
};

export default function setupDocs(app) {
	if (!config.get('docs.serve')) return;

	const address = config.get('host');
	const port = config.get('port');
	const docsSlug = config.get('docs.slug');
	logger.info(`Serving docs at ${chalk.cyan(`http://${address}:${port}${docsSlug}`)}`);
	app.use(docsSlug, swaggerUI.serve, swaggerUI.setup(documentObject));
}
