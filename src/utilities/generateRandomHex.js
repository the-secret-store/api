/**
 * Generates a random Hexadecimal number
 * @param {number} size Required string length;
 * @returns {string} Hex string
 */

export default function generateRandomHex(size) {
	return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}
