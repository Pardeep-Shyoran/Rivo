import app from './src/App.js';
import {connect} from './src/broker/rabbit.js'
import startListener from './src/broker/listener.js';

// Connect to RabbitMQ
connect().then(() => {
        startListener();
    console.log("RabbitMQ connection established");
}).catch((err) => {
    console.error("Failed to connect to RabbitMQ", err);
});


app.listen(3000, ()=> {
        console.log("server is running on post 3000");
})