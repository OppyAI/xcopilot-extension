import { workspace } from "vscode";

export const NOIRAGENT_WORKSPACE_KEY = "noiragent";
export const CONTINUE_WORKSPACE_KEY = NOIRAGENT_WORKSPACE_KEY;

export function getNoirAgentWorkspaceConfig() {
  return workspace.getConfiguration(NOIRAGENT_WORKSPACE_KEY);
}

export const getContinueWorkspaceConfig = getNoirAgentWorkspaceConfig;
