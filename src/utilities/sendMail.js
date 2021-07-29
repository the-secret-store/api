import config from 'config';
import { logger } from '@tools';
import { mailer } from '@tools';
import { prettyJson } from '@utilities';

/**
 * Sends email using the nodemailer transport
 * @param {string} to email address of the recipient
 * @param {string} subject subject of the email
 * @param {string} body the email body
 * @returns {Promise}
 */
export default function sendMail(to, subject, body) {
	const mailOptions = {
		from: '"The secret store" <no-reply@the-secret-store.com>',
		to,
		subject,
		text: body
	};

	logger.debug('Email: ' + prettyJson(mailOptions));

	// send mail with defined transport object on based on config
	if (config.get('sendEmails')) return mailer.sendMail(mailOptions);
}
