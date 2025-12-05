import App  from './src/App.js';
import connectDB from './src/db/db.js';
import config from './src/config/config.js';
import {connect} from './src/broker/rabbit.js'
import https from 'https';

connectDB();
connect();

const port = config.PORT || 3000;

App.listen(port, () => {
    console.log(`Auth service is running on port ${port}`);
    // Keep-alive ping (production only) to prevent cold sleep
    // if (process.env.NODE_ENV === 'production') {
    //     const base = config.BACKEND_URL || process.env.AUTH_SERVICE_URL || '';
    //     const keepAliveUrl = base ? base.replace(/\/$/, '') + '/health' : null;
    //     if (keepAliveUrl) {
    //         console.log(`[Keep-Alive] Auth ping enabled -> ${keepAliveUrl} every 10m`);
    //         setInterval(() => {
    //             https.get(keepAliveUrl, (res) => {
    //                 console.log(`[Keep-Alive] Auth ping status: ${res.statusCode}`);
    //             }).on('error', (e) => {
    //                 console.error(`[Keep-Alive] Auth ping failed: ${e.message}`);
    //             });
    //         }, 10 * 60 * 1000);
    //     } else {
    //         console.warn('[Keep-Alive] No BACKEND_URL/AUTH_SERVICE_URL set; auth keep-alive disabled');
    //     }
    // }
})

