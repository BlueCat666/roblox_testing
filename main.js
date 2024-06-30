import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let Servers = [
  {
    '2161db5d-5a39-415d-a54c-37d556b353ff': [
      {
        Name: 'SaloPor_23',
        AccountAge: 440,
        UserID: 4538764244,
        HasVerifiedBadge: false,
        DisplayName: 'ST4R'
      },
      {
        Name: 'Lucamartin581',
        AccountAge: 936,
        UserID: 3121604735,
        HasVerifiedBadge: false,
        DisplayName: 'Lucamartin581'
      }
    ]
  },
  {
    '2161db5d-5a39-415d-a54c-37d556b353ff': [
      {
        Name: 'SaloPor_23',
        AccountAge: 440,
        UserID: 4538764244,
        HasVerifiedBadge: false,
        DisplayName: 'ST4R'
      },
      {
        Name: 'Lucamartin581',
        AccountAge: 936,
        UserID: 3121604735,
        HasVerifiedBadge: false,
        DisplayName: 'Lucamartin581'
      }
    ]
  }
];

async function modifyPlayers(serversArray) {
  const modifiedServers = [];

  for (const server of serversArray) {
    const serverID = Object.keys(server)[0]; 
    const players = server[serverID];

    const modifiedPlayers = await Promise.all(players.map(async (player) => ({
      ...player,
      headThumbnail: await getPlayerHeadThumbnail(player.UserID)
    })));

    modifiedServers.push({ [serverID]: modifiedPlayers });
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

app.get("/", (req, res) => {
  console.log("reached here");
  res.sendStatus(200);
});

app.get("/players", async (req, res) => {
  const modifiedPlayers = await modifyPlayers(Servers);
  res.json(modifiedPlayers);
});

app.post("/post", (req, res) => {
  //make it so when u get player data it will modify it here
  // console.log(req.body);
  Servers = req.body;
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server listening to ${port}`);
});
