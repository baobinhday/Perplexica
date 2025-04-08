import { ChatAnthropic } from '@langchain/anthropic';
import { ChatModel, getModelsList, RawModel } from '.';
import { getAnthropicApiKey } from '../config';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

const loadModels = () => {
  return getModelsList()?.['chatModels']['anthropic']  as unknown as RawModel[]
}

export const loadAnthropicChatModels = async () => {
  const anthropicApiKey = getAnthropicApiKey();
  if (!anthropicApiKey) return {};

  const models = loadModels()

  try {
    const chatModels: Record<string, ChatModel> = {};

    models.forEach((model) => {
      chatModels[model.key] = {
        displayName: model.displayName,
        model: new ChatAnthropic({
          apiKey: anthropicApiKey,
          modelName: model.key,
          temperature: 0.7,
        }) as unknown as BaseChatModel,
      };
    });

    return chatModels;
  } catch (err) {
    console.error(`Error loading Anthropic models: ${err}`);
    return {};
  }
};
