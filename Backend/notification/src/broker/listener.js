import {subscribeToQueue} from './rabbit.js'
import sendEmail from '../utils/email.js';


function startListener() {
    subscribeToQueue('user_created', async (msg) => {

        const { email, role, fullName:{ firstName, lastName } } = msg;

        const template = `
        <h1>Welcome to Rivo, ${firstName} ${lastName}!</h1>
        <p>Your account has been created with the role of ${role}.</p>
        <p>We're excited to have you on board!</p>
        <p>We hope you enjoy your experience with us!</p>
        <p>Best regards,<br/>The Rivo Team</p>
        `;

        await sendEmail(
            email,
            'Welcome to Rivo!',
            `Welcome to Rivo, ${firstName} ${lastName}! Your account has been created with the role of ${role}.`,
            template
        );

    });
}

export default startListener;