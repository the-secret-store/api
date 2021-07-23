import { mailer } from '@tools';

/**
 * Sends email using the nodemailer transport
 * @param {string} to : email address of the recipient
 * @param {string} subject : subject of the email
 * @param {string} body : the email body
 * @returns {Promise}
 */
export default function sendMail(to, subject, body) {
	const mailOptions = {
		from: '"The secret store" <no-reply@the-secret-store.com>',
		to,
		subject,
		text: body
	};

	// send mail with defined transport object
	return mailer.sendMail(mailOptions);
}
