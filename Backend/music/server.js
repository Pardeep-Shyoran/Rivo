import App from "./src/App.js";
import config from "./src/config/config.js";
import connectDB from "./src/db/db.js";
import https from 'https';

// Connect to the database
connectDB();

const PORT = config.PORT;

// Start the server
App.listen(PORT, () => {
  console.log(`Music Service is running on port ${PORT}`);
  if (config.NODE_ENV === 'production') {
    const base = config.MUSIC_SERVICE_URL || '';
    const keepAliveUrl = base ? base.replace(/\/$/, '') + '/health' : null;
    if (keepAliveUrl) {
      console.log(`[Keep-Alive] Music ping enabled -> ${keepAliveUrl} every 10m`);
      setInterval(() => {
        https.get(keepAliveUrl, (res) => {
          console.log(`[Keep-Alive] Music ping status: ${res.statusCode}`);
        }).on('error', (e) => {
          console.error(`[Keep-Alive] Music ping failed: ${e.message}`);
        });
      }, 10 * 60 * 1000);
    } else {
      console.warn('[Keep-Alive] MUSIC_SERVICE_URL not set; music keep-alive disabled');
    }
  }
});
