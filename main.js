import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { initializeApp } from './config/firebaseConfig.js';
import gameRoutes from './routes/gameRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import { removeInactiveServers } from './controllers/gameController.js';

const app = express();
const port = process.env.PORT || 3000;

initializeApp();

app.use(cors());
app.use(bodyParser.json());

app.use('/', gameRoutes);
app.use('/', playerRoutes);

setInterval(removeInactiveServers, 5000);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
