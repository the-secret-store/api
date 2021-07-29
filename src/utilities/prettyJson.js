import config from 'config';

/**
 * Returns a prettified string representation of the object
 * @param {object} jsonObject
 * @returns {string} formatted string representation
 */
export default function prettyJson(jsonObject) {
	const prettifiedJson = JSON.stringify(jsonObject, null, '\t');
	return config.util.getEnv('NODE_ENV') === 'test'
		? prettifiedJson
		: prettifiedJson.replace(/(?<!\\)"/g, '').replace(/\\(?!!")/g, '');
}
