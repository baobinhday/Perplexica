import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { getOpenaiApiKey } from '../config';
import { ChatModel, EmbeddingModel, getModelsList, RawModel } from '.';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { Embeddings } from '@langchain/core/embeddings';

const loadModels = (modelType: 'chat' | 'embedding') => {
  return getModelsList()?.[modelType === 'chat' ? 'chatModels' : 'embeddingModels']['openai']  as unknown as RawModel[]
}

export const loadOpenAIChatModels = async () => {
  const openaiApiKey = getOpenaiApiKey();
  const models = loadModels('chat');

  if (!openaiApiKey || !models) return {};

  try {
    const chatModels: Record<string, ChatModel> = {};

    models.forEach((model) => {
      chatModels[model.key] = {
        displayName: model.displayName,
        model: new ChatOpenAI({
          openAIApiKey: openaiApiKey,
          modelName: model.key,
          temperature: 0.7,
        }) as unknown as BaseChatModel,
      };
    });

    return chatModels;
  } catch (err) {
    console.error(`Error loading OpenAI models: ${err}`);
    return {};
  }
};

export const loadOpenAIEmbeddingModels = async () => {
  const openaiApiKey = getOpenaiApiKey();
  const models = loadModels('embedding');

  if (!openaiApiKey || !models) return {};

  try {
    const embeddingModels: Record<string, EmbeddingModel> = {};

    models.forEach((model) => {
      embeddingModels[model.key] = {
        displayName: model.displayName,
        model: new OpenAIEmbeddings({
          openAIApiKey: openaiApiKey,
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
