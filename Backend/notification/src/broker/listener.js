import { subscribeToQueue } from './rabbit.js';
import sendEmail, { templates } from '../utils/email.js';

function startListener() {
    console.log('🎧 Starting message listeners...');
    
    try {
        // Account creation welcome email
        subscribeToQueue('user_created', async (msg) => {
            const { email, role, fullName } = msg;
            const { subject, text, html } = templates.userRegistered({ fullName, role });
            await sendEmail(email, subject, text, html);
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
            const { email, fullName, changed = [], timestamp, ip, userAgent } = msg;
            if (!changed.length) return; // Nothing notable changed
            const { subject, text, html } = templates.profileUpdated({ fullName, changed, timestamp, ip, userAgent });
            await sendEmail(email, subject, text, html);
        });

    // Password change security notification
        subscribeToQueue('user_password_changed', async (msg) => {
            const { email, fullName, timestamp, ip, userAgent } = msg;
            const { subject, text, html } = templates.passwordChanged({ fullName, timestamp, ip, userAgent });
            await sendEmail(email, subject, text, html);
        });

            // Profile picture updated
            subscribeToQueue('user_profile_picture_updated', async (msg) => {
                const { email, fullName, timestamp, ip, userAgent } = msg;
                const { subject, text, html } = templates.profilePhotoUpdated({ fullName, timestamp, ip, userAgent });
                await sendEmail(email, subject, text, html);
            });

            // Profile picture deleted
            subscribeToQueue('user_profile_picture_deleted', async (msg) => {
                const { email, fullName, timestamp, ip, userAgent } = msg;
                const { subject, text, html } = templates.profilePhotoDeleted({ fullName, timestamp, ip, userAgent });
                await sendEmail(email, subject, text, html);
            });
        
        console.log('✅ All message listeners registered successfully');
    } catch (error) {
        console.error('❌ Failed to start listeners:', error.message);
        console.error('⚠️  Emails will NOT be sent until RabbitMQ connection is established');
    }
}

export default startListener;