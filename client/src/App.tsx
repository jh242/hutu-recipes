import React, { useEffect, useMemo, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Recorder from "./components/Recorder";
import { playAudio } from "./utils";
import "./App.css";

function App() {
  const [conversation, setConversation] = useState<any[]>([]);
  const [waitingForResponse, setWaiting] = useState(false);
  const context = useMemo(() => new (window.AudioContext || (window as any).webkitAudioContext)(), []);
  const id = useMemo(() => {
    if (!window.localStorage.getItem("id")) window.localStorage.setItem("id", Date.now().toString());
    return window.localStorage.getItem("id");
  }, []);

  const wsUrl =
    process.env.NODE_ENV === "development"
      ? `ws://localhost:3001/chat?id=${id}`
      : `ws://${window.location.host}/chat?id=${id}`;

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(wsUrl, {
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
        if (message.role !== "user") setWaiting(false);
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
      <h1>糊涂菜谱</h1>
      {conversation.map((message, index) => (
        <div key={index}>
          <strong>{message.role}</strong>: <pre>{message.content}</pre>
        </div>
      ))}
      <div>
        <ClipLoader loading={waitingForResponse} size={150} color={"#123abc"} />
      </div>
      <div>
        <input
          type="text"
          id="messageInput"
          placeholder="Type your message here..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const message = e.currentTarget.value;
              sendMessage(message);
              setWaiting(true);
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
      <Recorder
        onRecordingComplete={(blob: any) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const buffer = e.target?.result as ArrayBuffer;
            sendMessage(buffer);
            setWaiting(true);
          };
          reader.readAsArrayBuffer(blob);
        }}
      />
    </div>
  );
}

export default App;
