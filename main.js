import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());


app.get("/", (req, res) => {
    console.log("reached here");
    res.sendStatus(200);
});

app.post("/post", (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server listening to ${port}`);
});
