import { subscribeToQueue } from './rabbit.js';
import sendEmail, { templates } from '../utils/email.js';

function startListener() {
    // Account creation welcome email
    subscribeToQueue('user_created', async (msg) => {
        const { email, role, fullName: { firstName, lastName } = {} } = msg;

        const html = `
            <h1>Welcome to Rivo, ${firstName || ''} ${lastName || ''}!</h1>
            <p>Your account has been created with the role of <strong>${role}</strong>.</p>
            <p>We're excited to have you on board. Explore music, create playlists, and engage with artists.</p>
            <p>If this wasn't you, please contact support immediately.</p>
            <hr />
            <p style="font-size:12px;color:#666;">This is an automated message. Please do not reply.</p>
        `;

        await sendEmail(
            email,
            'Welcome to Rivo!',
            `Welcome to Rivo, ${firstName || ''} ${lastName || ''}! Your ${role} account is ready.`,
            html
        );
    });

    // User login notification
    subscribeToQueue('user_logged_in', async (msg) => {
        const { email, fullName, timestamp, ip, userAgent } = msg;
        const { subject, text, html } = templates.userLoggedIn({ 
            fullName, 
            timestamp, 
            ip, 
            userAgent 
        });
        await sendEmail(email, subject, text, html);
    });

    // Profile update security notification
        subscribeToQueue('user_profile_updated', async (msg) => {
            const { email, changed = [], timestamp, ip, userAgent } = msg;
            if (!changed.length) return; // Nothing notable changed
            const { subject, text, html } = templates.profileUpdated({ changed, timestamp, ip, userAgent });
            await sendEmail(email, subject, text, html);
        });

    // Password change security notification
        subscribeToQueue('user_password_changed', async (msg) => {
            const { email, timestamp, ip, userAgent } = msg;
            const { subject, text, html } = templates.passwordChanged({ timestamp, ip, userAgent });
            await sendEmail(email, subject, text, html);
        });

            // Profile picture updated
            subscribeToQueue('user_profile_picture_updated', async (msg) => {
                const { email, timestamp, ip, userAgent } = msg;
                const { subject, text, html } = templates.profilePhotoUpdated({ timestamp, ip, userAgent });
                await sendEmail(email, subject, text, html);
            });

            // Profile picture deleted
            subscribeToQueue('user_profile_picture_deleted', async (msg) => {
                const { email, timestamp, ip, userAgent } = msg;
                const { subject, text, html } = templates.profilePhotoDeleted({ timestamp, ip, userAgent });
                await sendEmail(email, subject, text, html);
            });
}

export default startListener;