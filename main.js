import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";
import admin from "firebase-admin"


admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

console.log(process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'));


const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let serversData = {};
let serverTimestamps = {};

const INACTIVE_THRESHOLD = 10000;
const CLEANUP_INTERVAL = 5000;


async function modifyPlayers(serversObject) {
  const modifiedServers = {};
  const allUserIds = [];

  for (const serverID in serversObject) {
    const players = serversObject[serverID];
    players.forEach(player => {
      allUserIds.push(player.UserID);
    });
  }

  const playerThumbnails = await getPlayerHeadThumbnail(allUserIds);

  const thumbnailMap = {};
  playerThumbnails.forEach(thumbnail => {
    if (thumbnail && thumbnail.imageUrl) {
      thumbnailMap[thumbnail.targetId] = thumbnail.imageUrl;
    } else {
      return;
    }
  });

  for (const serverID in serversObject) {
    const players = serversObject[serverID];

    modifiedServers[serverID] = players.map(player => {
      return {
        ...player,
        headThumbnail: thumbnailMap[player.UserID] || null,
      };
    });
  }

  return modifiedServers;
}

async function getPlayerHeadThumbnail(userArrayID) {
  try {
    const userIds = userArrayID.join(",");
    const response = await axios.get(
      `https://thumbnails.roblox.com/v1/users/avatar-bust?userIds=${userIds}&size=48x48&format=Png&isCircular=false`
    );

    const thumbnails = response.data.data.map((thumbnailData) => {
      if (thumbnailData && thumbnailData.state === "Completed") {
        return {
          targetId: thumbnailData.targetId,
          imageUrl: thumbnailData.imageUrl,
        };
      } else {
        return null;
      }
    });

    return thumbnails;
  } catch (error) {
    console.error("Error fetching thumbnails:", error);
    return [];
  }
}

function removeInactiveServers() {
  const currentTime = Date.now();
  for (const serverId in serverTimestamps) {
    if (serverTimestamps.hasOwnProperty(serverId)) {
      if (currentTime - serverTimestamps[serverId] > INACTIVE_THRESHOLD) {
        // Remove inactive server data
        delete serversData[serverId];
        delete serverTimestamps[serverId];
        console.log(`Removed inactive server: ${serverId}`);
      }
    }
  }
}

async function getGameData() {
  try {
    const [gameResponse, votesResponse] = await Promise.all([
      axios.get('https://games.roblox.com/v1/games?universeIds=5929324911'),
      axios.get('https://games.roblox.com/v1/games/votes?universeIds=5929324911')
    ]);

    let data = gameResponse.data.data[0];
    const votes = votesResponse.data.data[0];

    data.upVotes = votes.upVotes;
    data.downVotes = votes.downVotes;

    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching game data:", error);
    return [];
  }
}

setInterval(removeInactiveServers, CLEANUP_INTERVAL);

const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying ID token:", error);
    res.status(401).send("Unauthorized");
  }
};

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.get("/players", async (req, res) => {
  const modifiedPlayers = await modifyPlayers(serversData);
  // console.log(serverTimestamps);
  res.json(modifiedPlayers);
});

app.get("/get-game-data", authenticate, async (req,res) => {
  res.json(await getGameData()); 
});

app.post("/post", (req, res) => {
  //make it so when u get player data it will modify it here
  const serverData = req.body;

  for (const serverId in serverData) {
    if (serverData.hasOwnProperty(serverId)) {
      // Update server data
      serversData[serverId] = serverData[serverId];
      // Update the timestamp for the server
      serverTimestamps[serverId] = Date.now();
      console.log('Updated Servers Data:', serverId);
    }
  }

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server listening to ${port}`);
});
