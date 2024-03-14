import React, { useEffect, useMemo, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { playAudio } from "./utils";
import "./App.css";

function App() {
  const [conversation, setConversation] = useState<any[]>([]);
  const context = useMemo(() => new (window.AudioContext || (window as any).webkitAudioContext)(), []);

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket("ws://localhost:3001/chat?id=a", {
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
    share: true,
  });

  useEffect(() => {
    if (readyState === ReadyState.OPEN) (getWebSocket() as any).binaryType = "arraybuffer";
  }, [getWebSocket, readyState]);

  useEffect(() => {
    if (!lastMessage) {
      return;
    } else if (typeof lastMessage.data === "string") {
      // Handle incoming text messages
      const message = JSON.parse(lastMessage.data);
      if (message.type && message.type === "audio") {
        console.log("Preparing to receive binary audio data of size:", message.size);
      } else {
        console.log("Text message received:", message);
        setConversation((prev) => prev.concat(message));
      }
    } else if (lastMessage.data instanceof ArrayBuffer) {
      // Handle incoming binary messages (audio data)
      console.log("Binary message received, length:", lastMessage.data.byteLength);

      // Decode and play the audio
      playAudio(context, lastMessage.data);
    }
  }, [lastMessage, context]);

  return (
    <div className="App">
      <h1>Simple React Chat</h1>
      {conversation.map((message, index) => (
        <div key={index}>
          <strong>Bot</strong>: {message.content}
        </div>
      ))}
      <input
        type="text"
        id="messageInput"
        placeholder="Type your message here..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const message = e.currentTarget.value;
            sendMessage(message);
            e.currentTarget.value = "";
          }
        }}
      />
    </div>
  );
}

export default App;
