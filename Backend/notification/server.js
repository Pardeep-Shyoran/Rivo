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
    const healthUrl = base ? (base.replace(/\/$/, '') + '/health') : null;
    const reconnectUrl = base ? (base.replace(/\/$/, '') + '/reconnect') : null;
    
    if (healthUrl && reconnectUrl) {
      console.log(`[Keep-Alive] Enabled. Will check health every 8m and trigger reconnect if needed.`);
      
      setInterval(() => {
        // First, check health
        https.get(healthUrl, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            console.log(`[Keep-Alive] Health check status: ${res.statusCode}`);
            
            // If service is degraded (503), trigger reconnection
            if (res.statusCode === 503) {
              console.warn('[Keep-Alive] Service degraded (503), triggering reconnection...');
              
              const postData = '';
              const options = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(postData)
                }
              };
              
              const reconnectReq = https.request(reconnectUrl, options, (reconnectRes) => {
                let reconnectData = '';
                reconnectRes.on('data', (chunk) => { reconnectData += chunk; });
                reconnectRes.on('end', () => {
                  console.log(`[Keep-Alive] Reconnect attempt status: ${reconnectRes.statusCode}`);
                  try {
                    const result = JSON.parse(reconnectData);
                    if (result.rabbitmq?.connected) {
                      console.log('[Keep-Alive] ✅ Reconnection successful!');
                    } else {
                      console.warn('[Keep-Alive] ⚠️ Reconnection attempt completed but connection still not established');
                    }
                  } catch (e) {
                    console.error('[Keep-Alive] Failed to parse reconnect response');
                  }
                });
              });
              
              reconnectReq.on('error', (e) => {
                console.error(`[Keep-Alive] Reconnect request failed: ${e.message}`);
              });
              
              reconnectReq.write(postData);
              reconnectReq.end();
            } else if (res.statusCode === 200) {
              try {
                const healthData = JSON.parse(data);
                if (healthData.rabbitmq?.connected) {
                  console.log('[Keep-Alive] ✅ Service healthy, RabbitMQ connected');
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          });
        }).on('error', (e) => {
          console.error(`[Keep-Alive] Health check failed: ${e.message}`);
        });
      }, 8 * 60 * 1000); // Every 8 minutes (more frequent than 10m)
    } else {
      console.warn('[Keep-Alive] NOTIFICATION_SERVICE_URL not set; keep-alive disabled');
    }
  }
});
