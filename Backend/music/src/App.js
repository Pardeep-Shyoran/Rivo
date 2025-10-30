import express from 'express';
import musicRoutes from './routes/music.routes.js';
import cookieParser from 'cookie-parser';



const App = express();

App.use(cookieParser());
App.use(express.json());

App.use('/api/music', musicRoutes);


export default App;