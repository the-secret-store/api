/**
 * Returns a prettified string representation of the object
 * @param {object} jsonObject
 * @returns {string} formatted string representation
 */
export default function prettyJson(jsonObject) {
	JSON.stringify(jsonObject, null, '\t');
}
