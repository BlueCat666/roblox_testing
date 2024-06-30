import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const Servers = [
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
      },
      {
        Name: 'Arellyscueva2016',
        AccountAge: 318,
        UserID: 4938845599,
        HasVerifiedBadge: false,
        DisplayName: 'Arellyscueva2016'
      },
      {
        Name: 'AlexPor2018',
        AccountAge: 417,
        UserID: 4608231204,
        HasVerifiedBadge: false,
        DisplayName: 'Alex'
      }
    ]
  }
];

async function modifyPlayers(serversArray) {
  const modifiedPlayers = [];

  for (const server of serversArray) {
    const [serverID, players] = Object.entries(server)[0];

    for (const player of players) {
      const playerThumbnail = await getPlayerHeadThumbnail(player.UserID);
      player.headThumbnail = playerThumbnail;
      modifiedPlayers.push(player);
    }
  }

  return modifiedPlayers;
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
  console.log(modifiedPlayers);
  res.json(modifiedPlayers);
});

// app.get("/get-head-thumbnail", async (req, res) => {
//   //make is so it will get profile pic in players and not in another request
//   const userID = req.query.userID;
//   try {
//     const { data } = await axios.get(
//       `https://thumbnails.roblox.com/v1/users/avatar-bust?userIds=${userID}&size=48x48&format=Png&isCircular=false`
//     );
//     res.json(data);
//   } catch (error) {
//     console.error("Error fetching thumbnail:", error);
//     res.status(500).json({ error: "Error fetching thumbnail" });
//   }
// });

app.post("/post", (req, res) => {
  //make it so when u get player data it will modify it here
  console.log(req.body);
  Players = req.body;
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server listening to ${port}`);
});
