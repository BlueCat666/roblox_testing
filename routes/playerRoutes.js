import express from 'express';
import { kickPlayer, getPlayerData } from '../controllers/playerController.js';

const router = express.Router();

router.post('/kick', kickPlayer);
router.get('/get-data', getPlayerData);

export default router;
