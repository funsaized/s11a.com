// Swamp audit plugin for OpenCode
// Records bash tool invocations for the swamp audit timeline.
// This is a managed file — it will be overwritten on swamp upgrade.

import type { Plugin } from "@opencode-ai/plugin";

const pendingCommands = new Map();

export const SwampAudit: Plugin = async ({ directory }) => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool !== "bash") return;
      const command = output.args?.command;
      if (command && input.sessionID) {
        pendingCommands.set(input.sessionID, command);
      }
    },
    "tool.execute.after": async (input) => {
      if (input.tool !== "bash") return;
      const command = pendingCommands.get(input.sessionID);
      pendingCommands.delete(input.sessionID);
      if (!command) return;

      try {
        const payload = JSON.stringify({
          tool_name: "bash",
          tool_input: { command },
          cwd: directory,
          session_id: input.sessionID,
        });
        const proc = Bun.spawn(
          ["swamp", "audit", "record", "--from-hook", "--tool", "opencode"],
          { stdin: new Blob([payload]) },
        );
        await proc.exited;
      } catch {
        // Must never throw — this is a hook
      }
    },
  };
};
