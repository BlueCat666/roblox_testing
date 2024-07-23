import axios from 'axios';
import { modifyPlayersData } from '../utils/modifyPlayersData.js';


let serversData = {};
let serverTimestamps = {};
const INACTIVE_THRESHOLD = 10000;

export const getGameData = async (req, res) => {
  try {
    const [gameResponse, votesResponse] = await Promise.all([
      axios.get('https://games.roblox.com/v1/games?universeIds=5929324911'),
      axios.get('https://games.roblox.com/v1/games/votes?universeIds=5929324911')
    ]);

    let data = gameResponse.data.data[0];
    const votes = votesResponse.data.data[0];

    data.upVotes = votes.upVotes;
    data.downVotes = votes.downVotes;

    res.json(data);
  } catch (error) {
    console.error("Error fetching game data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getActiveServerData = async (req, res) => {
    const modifiedPlayers = await modifyPlayersData(serversData);
    res.json(modifiedPlayers);
};

export const saveActiveServers = (req, res) => {
    const serverData = req.body;
  
    for (const serverId in serverData) {
      if (serverData.hasOwnProperty(serverId)) {
        serversData[serverId] = serverData[serverId];
        serverTimestamps[serverId] = Date.now();
      }
    }
  
    res.sendStatus(200);
};


export const removeInactiveServers = () => {
    const currentTime = Date.now();
    for (const serverId in serverTimestamps) {
      if (serverTimestamps.hasOwnProperty(serverId)) {
        if (currentTime - serverTimestamps[serverId] > INACTIVE_THRESHOLD) {
          delete serversData[serverId];
          delete serverTimestamps[serverId];
        }
      }
    }
  };
