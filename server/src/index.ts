import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";
import { WebSocket } from "ws";
import { OpenAIRoles, Client } from "./types";
import ws from "express-ws"; // Import express-ws

dotenv.config();
const { app } = ws(express()); // Wrap the app with express-ws
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

// Type declaration for WebSocket

const clients: { [key: string]: Client } = {};
const openai = new OpenAI();
const systemMessage =
  "You are a helpful assistant whose main purpose is to provide information on chinese cooking and responds in simplified chinese. Do not provide recipe steps and ingredients unless asked how to make a specific dish.";

app.ws("/chat", (ws: WebSocket, req) => {
  const id = req.query.id as string;
  if (!id) {
    ws.close(1008, "No id provided");
    return;
  }

  const client: Client = {
    conversation: [{ role: OpenAIRoles.system, content: systemMessage, name: "system" }],
    ws: ws,
  };
  clients[id] = client;

  ws.on("message", async (message: string) => {
    try {
      client.conversation.push({ role: OpenAIRoles.user, content: message, name: "user" });

      const resp = await openai.chat.completions.create({
        messages: client.conversation,
        model: "gpt-4",
      });

      const responseMessage = resp.choices[0];
      if (!responseMessage) {
        ws.close(1011, "No response from OpenAI");
        return;
      }
      client.conversation.push(responseMessage.message);
      ws.send(JSON.stringify(responseMessage.message));

      const speech = await openai.audio.speech.create({
        input: responseMessage.message.content || "",
        model: "tts-1",
        voice: "alloy",
      });

      // Obtain audio binary data as a buffer
      const audioBuffer = Buffer.from(await speech.arrayBuffer());

      // To send binary data, first indicate to the client that binary data will follow
      // This can be a simple protocol where you define a specific message structure
      ws.send(JSON.stringify({ type: "audio", size: audioBuffer.byteLength })); // Send indicator + size

      // Send the binary audio data
      ws.send(audioBuffer);
    } catch (error) {
      // Handle any error that occurred during audio generation
      console.error("Error sending response:", error);
      // Optionally you can close the connection or just ignore the error
    }
  });

  ws.on("close", () => {
    delete clients[id];
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
