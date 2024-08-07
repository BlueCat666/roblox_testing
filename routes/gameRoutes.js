import express from 'express';
import { saveActiveServers, getActiveServerData, getGameData } from '../controllers/gameController.js';

const router = express.Router();

router.get('/get-game-data', getGameData);
router.post('/save-servers-data', saveActiveServers);
router.get('/get-servers-data', getActiveServerData);

export default router;
