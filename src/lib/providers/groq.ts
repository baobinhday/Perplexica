import { ChatOpenAI } from '@langchain/openai';
import { getGroqApiKey } from '../config';
import { ChatModel, getModelsList, RawModel } from '.';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

const loadModels = () => {
  return getModelsList()?.chatModels['groq'] as unknown as RawModel[]
}

export const loadGroqChatModels = async () => {
  const groqApiKey = getGroqApiKey();
  if (!groqApiKey) return {};

  const models = loadModels()

  try {
    const chatModels: Record<string, ChatModel> = {};

    models.forEach((model) => {
      chatModels[model.key] = {
        displayName: model.displayName,
        model: new ChatOpenAI({
          openAIApiKey: groqApiKey,
          modelName: model.key,
          temperature: 0.7,
          configuration: {
            baseURL: 'https://api.groq.com/openai/v1',
          },
        }) as unknown as BaseChatModel,
      };
    });

    return chatModels;
  } catch (err) {
    console.error(`Error loading Groq models: ${err}`);
    return {};
  }
};
