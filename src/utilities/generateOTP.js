/**
 * A function that returns a 6 digit random number
 * @returns {number}
 */
export default function generateOTP() {
	return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
}
