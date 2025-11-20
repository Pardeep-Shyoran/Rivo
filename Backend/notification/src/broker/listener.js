import { subscribeToQueue } from './rabbit.js';
import sendEmail, { templates } from '../utils/email.js';

function startListener() {
    console.log('🎧 Starting message listeners...');
    
    try {
        // Account creation welcome email
        subscribeToQueue('user_created', async (msg) => {
        const { email, role, fullName: { firstName, lastName } = {} } = msg;
        const userName = `${firstName || ''} ${firstName || lastName ? ' ' : ''}${lastName || ''}`.trim();

        const content = `
            <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">Welcome to Rivo!</h2>
            <p style="margin:0 0 15px 0;">We're thrilled to have you join our music community. Your account has been successfully created with the role of <strong style="color:#667eea;">${role}</strong>.</p>
            
            <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius:8px; padding:20px; margin:20px 0;">
                <h3 style="margin:0 0 15px 0; font-size:18px; color:#1a202c; font-weight:600;">Get Started:</h3>
                <ul style="margin:0; padding-left:20px; color:#4a5568; line-height:1.8;">
                    <li>Explore millions of songs and playlists</li>
                    <li>Create and share your own playlists</li>
                    <li>Connect with artists and other music lovers</li>
                    <li>Discover personalized music recommendations</li>
                </ul>
            </div>

            <p style="margin:20px 0 0 0; color:#4a5568;">
                If you have any questions or need assistance, our support team is here to help.
            </p>
        `;

        const { emailLayout } = await import('../utils/email.js');
        const html = emailLayout(content, userName);

        await sendEmail(
            email,
            'Welcome to Rivo!',
            `Welcome to Rivo, ${userName}! Your ${role} account is ready.`,
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