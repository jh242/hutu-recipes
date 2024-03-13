export type OpenAIRole = "system" | "user" | "function" | "assistant";

export const OpenAiRoles = {
  system: "system" as OpenAIRole,
  user: "user" as OpenAIRole,
  function: "function" as OpenAIRole,
  assistant: "assistant" as OpenAIRole,
};
