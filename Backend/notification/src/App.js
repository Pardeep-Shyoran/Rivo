import express from 'express';
import sendEmail from './utils/email.js';

const app = express();

sendEmail("shyoran0007@gmail.com", "Test Email", "This is test Email from Rivo", "<h1>This is test Email from Rivo - Music for all</h1>");


export default app;