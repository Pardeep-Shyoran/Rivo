import App from './src/App.js';
import config from './src/config/config.js';
import connectDB from './src/db/db.js';

// Connect to the database
connectDB();


const PORT = config.PORT;

// Start the server
App.listen(PORT, () => {
  console.log(`Music Service is running on port ${PORT}`);
});