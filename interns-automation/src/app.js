import express from "express";
import { runBot } from "./controllers/botController.js";

const app = express();

app.use(express.json());

app.post("/run-bot", runBot);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});