import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from '@langchain/google-genai';
import { getGeminiApiKey } from '../config';
import { ChatModel, EmbeddingModel, getModelsList, RawModel } from '.';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { Embeddings } from '@langchain/core/embeddings';

const loadModels = (modelType: 'chat' | 'embedding') => {
  return getModelsList()?.[modelType === 'chat' ? 'chatModels' : 'embeddingModels']['gemini']  as unknown as RawModel[]
}

export const loadGeminiChatModels = async () => {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) return {};

  const models = loadModels('chat');

  try {
    const chatModels: Record<string, ChatModel> = {};

    models.forEach((model) => {
      chatModels[model.key] = {
        displayName: model.displayName,
        model: new ChatGoogleGenerativeAI({
          apiKey: geminiApiKey,
          modelName: model.key,
          temperature: 0.7,
        }) as unknown as BaseChatModel,
      };
    });

    return chatModels;
  } catch (err) {
    console.error(`Error loading Gemini models: ${err}`);
    return {};
  }
};

export const loadGeminiEmbeddingModels = async () => {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) return {};

  const models = loadModels('embedding');

  try {
    const embeddingModels: Record<string, EmbeddingModel> = {};

    models.forEach((model) => {
      embeddingModels[model.key] = {
        displayName: model.displayName,
        model: new GoogleGenerativeAIEmbeddings({
          apiKey: geminiApiKey,
          modelName: model.key,
        }) as unknown as Embeddings,
      };
    });

    return embeddingModels;
  } catch (err) {
    console.error(`Error loading OpenAI embeddings models: ${err}`);
    return {};
  }
};
