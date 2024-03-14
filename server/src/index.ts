import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI, { toFile } from "openai";
import { WebSocket } from "ws";
import { OpenAIRoles, Client } from "./types";
import ws from "express-ws"; // Import express-ws
import fs from "fs";

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
  "You are a helpful assistant whose main purpose is to provide information on chinese cooking. Only provide detailed recipes when explicitly asked. Do not answer any questions unrelated to food. Respond in simplified chinese.";

app.ws("/chat", (ws: WebSocket, req) => {
  ws.binaryType = "arraybuffer";
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

  ws.on("message", async (message: string | ArrayBuffer) => {
    let inputText = "";
    if (message instanceof ArrayBuffer) {
      // Convert the ArrayBuffer from the WebSocket message to a Buffer
      const buffer = Buffer.from(message);
      const transcription = await openai.audio.transcriptions.create({
        file: await toFile(buffer, "audio.wav", {
          type: "audio/wav",
        }),
        model: "whisper-1",
        language: "zh",
      });
      inputText = transcription.text;
    } else {
      inputText = message;
    }

    const userMessage = { role: OpenAIRoles.user, content: inputText, name: "user" };
    ws.send(JSON.stringify(userMessage));
    client.conversation.push(userMessage);

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
    try {
      const speech = await openai.audio.speech.create({
        input: responseMessage.message.content || "",
        model: "tts-1",
        voice: "nova",
      });

      // Obtain audio binary data as a buffer
      const audioBuffer = Buffer.from(await speech.arrayBuffer());
      // Send audio and text together
      ws.send(JSON.stringify({ type: "audio", size: audioBuffer.byteLength }));
      ws.send(JSON.stringify(responseMessage.message));
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
