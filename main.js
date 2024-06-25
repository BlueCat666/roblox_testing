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
  res.json(Players);
});

app.post("/post", (req, res) => {
  console.log(req.body);
  Players = req.body
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server listening to ${port}`);
});
