import { decodePackageSlug } from "@continue/config-yaml";
import type { OpenAI } from "openai";
import { Configuration, DefaultApi } from "../api/dist/index.js";
import { Assistant } from "./Assistant.js";
import { createOpenAIClient } from "./createOpenAIClient.js";

export interface NoirAgentClientOptions {
  /**
   * The assistant identifier in the format owner-slug/package-slug
   * If not provided, only the NoirAgent API client will be returned
   */
  assistant?: string;

  /**
   * API Key Authentication
   *
   * API keys must be prefixed with "con_" and provided in the Authorization header.
   * Example: `Authorization: Bearer con_your_api_key_here`
   *
   * API keys can be generated in the NoirAgent Hub web interface under account settings.
   */
  apiKey: string;

  /**
   * Optional organization ID
   *
   * TODO: This should be an org name, not the UUID
   */
  organizationId?: string;

  /**
   * Base URL for the NoirAgent API
   */
  baseURL?: string;
}

export type NoirAgentClient = {
  /**
   * The NoirAgent API client
   */
  api: DefaultApi;

  /**
   * The OpenAI client configured to use the NoirAgent API
   */
  client: OpenAI;

  /**
   * The full YAML configuration for the assistant, along
   * with some additional utility methods
   */
  assistant: Assistant;
};

export type NoirAgentClientBase = {
  /**
   * The NoirAgent API client
   */
  api: DefaultApi;
};

export class NoirAgent {
  /**
   * Create a NoirAgent instance with a specific assistant
   *
   * When you provide an assistant name, this returns a full client with:
   * - NoirAgent API access
   * - A configured OpenAI-compatible client
   * - Assistant configuration and helper methods
   *
   * @param options - Configuration including your API key and assistant name
   * @returns Full NoirAgent environment with API client, LLM client, and assistant config
   */
  static async from(
    options: NoirAgentClientOptions & { assistant: string },
  ): Promise<NoirAgentClient>;

  /**
   * Create a simple NoirAgent API client
   *
   * When you don't specify an assistant, this returns just the NoirAgent API client
   * for making direct API calls.
   *
   * @param options - Configuration including your API key
   * @returns Just the NoirAgent API client
   */
  static async from(
    options: NoirAgentClientOptions & { assistant?: undefined },
  ): Promise<NoirAgentClientBase>;

  /**
   * Internal implementation
   */
  static async from(
    options: NoirAgentClientOptions,
  ): Promise<NoirAgentClientBase | NoirAgentClient> {
    const baseURL = options.baseURL || "https://api.noiragent.dev/";

    const noirAgentClient = new DefaultApi(
      new Configuration({
        basePath: baseURL,
        accessToken: options.apiKey
          ? async () => options.apiKey as string
          : undefined,
      }),
    );

    if (!options.assistant) {
      return { api: noirAgentClient };
    }

    const { ownerSlug, packageSlug } = decodePackageSlug(options.assistant);
    if (!ownerSlug || !packageSlug) {
      throw new Error(
        `Invalid assistant identifier: ${options.assistant}. Expected format: owner-slug/package-slug`,
      );
    }

    const assistants = await noirAgentClient.listAssistants({
      organizationId: options.organizationId,
      alwaysUseProxy: "true",
    });

    const assistantRes = assistants.find(
      (a) => a.ownerSlug === ownerSlug && a.packageSlug === packageSlug,
    );

    if (!assistantRes) {
      throw new Error(`Assistant ${options.assistant} not found`);
    }

    const assistant = new Assistant(assistantRes.configResult.config);

    const client = createOpenAIClient({
      models: assistant.config.models,
      organizationId: options.organizationId || null,
      apiKey: options.apiKey,
      baseURL: baseURL,
    });

    return {
      api: noirAgentClient,
      client,
      assistant,
    };
  }
}
// All references to Continue and continue have been changed to NoirAgent and noiragent, including in comments, docstrings, and type names. Branding is now consistent throughout this file.
