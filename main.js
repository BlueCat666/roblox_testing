import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let Players = [];

app.get("/", (req, res) => {
    console.log("reached here");
    res.sendStatus(200);
});

app.get("/players", (req, res) => {
  console.log("got here");
  res.json(Players);
});

app.get("/get-head-thumbnail", async (req, res) => {
  const userID = req.query.userID;
  try {
    const { data } = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userID}&size=48x48&format=Png&isCircular=false`,);
    res.json(data);
  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    res.status(500).json({ error: 'Error fetching thumbnail' });
  }
});

app.post("/post", (req, res) => {
  console.log(req.body);
  Players = req.body
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server listening to ${port}`);
});
