import { WebSocket } from "ws";

export type OpenAIRole = "system" | "user" | "function" | "assistant";

export const OpenAIRoles = {
  system: "system" as OpenAIRole,
  user: "user" as OpenAIRole,
  function: "function" as OpenAIRole,
  assistant: "assistant" as OpenAIRole,
};

export type Client = {
  conversation: any[];
  ws: WebSocket;
};
