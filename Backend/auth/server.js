import App  from './src/App.js';
import connectDB from './src/db/db.js';
import config from './src/config/config.js';
import {connect} from './src/broker/rabbit.js'

connectDB();
connect();

const port = config.PORT || 3000;

App.listen(port, () => {
    console.log(`Auth service is running on port ${port}`);
})

