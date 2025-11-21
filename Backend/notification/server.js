import app from "./src/App.js";
import { connect } from "./src/broker/rabbit.js";
import startListener from "./src/broker/listener.js";
import config from "./src/config/config.js";
import net from "net";
import dns from "dns";
import https from "https";
// Force Node to use IPv4 instead of IPv6
dns.setDefaultResultOrder("ipv4first");

console.log("🚀 Starting Notification Service...");
console.log("📋 Environment:", process.env.NODE_ENV || "development");

const PORT = process.env.PORT || config.PORT || 10000;
const HOST = "0.0.0.0"; // Required for Render

// Add this route to test connectivity
app.get("/test-network", (req, res) => {
  dns.lookup("smtp.gmail.com", (err, address, family) => {
    if (err) {
      return res.status(500).json({ error: "DNS Lookup Failed", details: err });
    }
    res.json({ status: "Success", address: address, family: "IPv" + family });
  });
});


app.get('/test-port', (req, res) => {
  const client = new net.Socket();
  const startTime = Date.now();

  // 1. Try to connect to Gmail on Port 465
  client.connect(465, 'smtp.gmail.com', () => {
    const timeTaken = Date.now() - startTime;
    res.json({ status: 'Connected!', time_ms: timeTaken, message: 'Port 465 is OPEN' });
    client.destroy();
  });

  // 2. Handle Errors
  client.on('error', (err) => {
    res.status(500).json({ status: 'Failed', error: err.message, code: err.code });
  });

  // 3. Handle Timeout (Force fail after 5s)
  client.setTimeout(5000);
  client.on('timeout', () => {
    res.status(504).json({ status: 'Timeout', message: 'Port 465 is BLOCKED by Firewall/Google' });
    client.destroy();
  });
});

// START HTTP SERVER FIRST (Critical for Render deployment)
app.listen(PORT, HOST, () => {
  console.log(`✅ Notification service is running on port ${PORT}`);
  console.log(`🏥 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🌐 Listening on ${HOST}:${PORT}`);

  // THEN connect to RabbitMQ in the background
  connect()
    .then(() => {
      console.log("✅ RabbitMQ connection established");
      startListener();
      console.log("👂 Email listeners activated");
    })
    .catch((err) => {
      console.error("❌ Failed to connect to RabbitMQ");
      console.error("Error details:", err?.message || err);
      console.error("⚠️  Service will start but emails will NOT be sent!");
    });

  // Production keep-alive pings (e.g., Render free plan sleep prevention)
  if (process.env.NODE_ENV === 'production') {
    const base = config.NOTIFICATION_SERVICE_URL || '';
    const keepAliveUrl = base ? (base.replace(/\/$/, '') + '/health') : null;
    if (keepAliveUrl) {
      console.log(`[Keep-Alive] Enabled. Will ping ${keepAliveUrl} every 10m.`);
      setInterval(() => {
        https.get(keepAliveUrl, (res) => {
          console.log(`[Keep-Alive] Ping status: ${res.statusCode}`);
        }).on('error', (e) => {
          console.error(`[Keep-Alive] Ping failed: ${e.message}`);
        });
      }, 10 * 60 * 1000); // 10 minutes
    } else {
      console.warn('[Keep-Alive] NOTIFICATION_SERVICE_URL not set; keep-alive disabled');
    }
  }
});
