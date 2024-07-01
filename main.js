import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";

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

  for (const serverID in serversObject) {
    const players = serversObject[serverID];

    const modifiedPlayers = await Promise.all(players.map(async (player) => {
      const playerThumbnail = await getPlayerHeadThumbnail(player.UserID);
      return { ...player, headThumbnail: playerThumbnail };
    }));

    modifiedServers[serverID] = modifiedPlayers;
  }

  return modifiedServers;
}


async function getPlayerHeadThumbnail(userID) {
  try {
    const response = await axios.get(
      `https://thumbnails.roblox.com/v1/users/avatar-bust?userIds=${userID}&size=48x48&format=Png&isCircular=false`
    );

    const thumbnailData =
      response.data && response.data.data && response.data.data[0];
    if (
      thumbnailData &&
      thumbnailData.state === "Completed" &&
      thumbnailData.imageUrl
    ) {
      return thumbnailData.imageUrl;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching thumbnail:", error);
    return null;
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

setInterval(removeInactiveServers, CLEANUP_INTERVAL);

app.get("/", (req, res) => {
  console.log("reached here");
  res.sendStatus(200);
});

app.get("/players", async (req, res) => {
  const modifiedPlayers = await modifyPlayers(serversData);
  console.log(serverTimestamps);
  res.json(modifiedPlayers);
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
    }
  }
  
  console.log('Updated Servers Data:', serversData);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server listening to ${port}`);
});
