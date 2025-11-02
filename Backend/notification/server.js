import app from './src/App.js';
import {connect} from './src/broker/rabbit.js'
import startListener from './src/broker/listener.js';
import config from './src/config/config.js';

// Connect to RabbitMQ
connect().then(() => {
        startListener();
    console.log("RabbitMQ connection established");
}).catch((err) => {
    console.error("Failed to connect to RabbitMQ", err);
});

const PORT = config.PORT;

// Start the server

app.listen(PORT, ()=> {
        console.log(`server is running on port ${PORT}`);
})