import axios from 'axios';
import config from '../config/config.js';

export const wakeUpNotificationService = () => {
    const baseUrl = config.NOTIFICATION_SERVICE_URL;

    if (!baseUrl) {
        console.warn("⚠️ Notification Service URL not set in .env");
        return;
    }

    // Ensure the URL ends with /health endpoint
    const healthUrl = baseUrl.endsWith('/') 
        ? `${baseUrl}health` 
        : `${baseUrl}/health`;

    // ⚡ FIRE AND FORGET
    // We do not return the promise. We do not await it.
    // We just send the request and catch errors silently so the main app never crashes.
    axios.get(healthUrl, { timeout: 5000 })
        .then(() => console.log("📡 Wake-up signal sent to Notification Service"))
        .catch((err) => {
            // It's okay if this fails (e.g., service is already down or network issue)
            // We don't want to stop the user's login process.
            console.log("Note: Wake-up signal failed (Service might be sleeping deeply or starting up)");
        });
};