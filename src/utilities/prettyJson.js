/**
 * Returns a prettified string representation of the object
 * @param {object} jsonObject
 * @returns {string} formatted string representation
 */
export default function prettyJson(jsonObject) {
	return JSON.stringify(jsonObject, null, '\t')
		.replaceAll(/(?<!\\)"/g, '')
		.replaceAll(/\\(?!!")/g, '');
}
