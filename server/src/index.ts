import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import OpenAI from "openai";
import { OpenAiRoles } from "./types";
import path from "path";
import fs from "fs";
import { ChatCompletionMessageParam } from "openai/resources";

dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

const clients: { [key: string]: { res: Response; conversation: any[] } } = {};
const openai = new OpenAI();
const systemMessage =
  "You are a helpful assistant whose main purpose is to provide information on chinese cooking and responds in simplified chinese. Do not provide recipe steps and ingredients unless asked how to make a specific dish.";

const chatConnectController = (req: Request, res: Response) => {
  const id = req.query.id as string;
  if (!id) {
    res.status(400).send("No id provided");
    return;
  }

  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };

  res.writeHead(200, headers);
  clients[id] = { res, conversation: [{ role: OpenAiRoles.system, content: systemMessage, name: "system" }] };

  res.on("close", () => {
    delete clients[id];
  });
};

const newChatMessageController = async (req: Request, res: Response) => {
  const id = req.query.id as string;
  if (!id || !clients[id]) {
    res.status(400).send("No id provided");
    return;
  }
  const message = req.body.message as string;
  clients[id].conversation.push({ role: OpenAiRoles.user, content: message, name: "user" });

  const resp = await openai.chat.completions.create({
    messages: clients[id].conversation,
    model: "gpt-4",
  });

  const responseMessage = resp.choices[0];
  if (!responseMessage) {
    res.status(500).send("No response from OpenAI");
    return;
  }
  clients[id].conversation.push(responseMessage.message);
  clients[id].res.write(`data: ${JSON.stringify(responseMessage.message)}`);

  const speech = await openai.audio.speech.create({
    input: responseMessage.message.content || "",
    model: "tts-1",
    voice: "alloy",
  });

  const speechBuffer = Buffer.from(await speech.arrayBuffer());
  const speechFile = path.resolve("./speech.mp3");
  await fs.promises.writeFile(speechFile, speechBuffer);
  res.sendStatus(200);
};

app.get("/chat", chatConnectController);

app.post("/chat", newChatMessageController);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
