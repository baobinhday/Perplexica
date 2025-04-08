import { Embeddings } from '@langchain/core/embeddings'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { loadOpenAIChatModels, loadOpenAIEmbeddingModels } from './openai'
import {
  getCustomOpenaiApiKey,
  getCustomOpenaiApiUrl,
  getCustomOpenaiModelName,
} from '../config'
import { ChatOpenAI } from '@langchain/openai'
import { loadOllamaChatModels, loadOllamaEmbeddingModels } from './ollama'
import { loadGroqChatModels } from './groq'
import { loadAnthropicChatModels } from './anthropic'
import { loadGeminiChatModels, loadGeminiEmbeddingModels } from './gemini'
import { loadTransformersEmbeddingsModels } from './transformers'
import path from 'path'
import fs from 'fs'

export interface ChatModel {
  displayName: string
  model: BaseChatModel
}

export interface EmbeddingModel {
  displayName: string
  model: Embeddings
}

export type RawModel = {
  displayName: string
  key: string
}

type ModelsList = {
  [key in "chatModels" | "embeddingModels"]: {
    [key: string]: RawModel[]
  }
}

export const chatModelProviders: Record<
  string,
  () => Promise<Record<string, ChatModel>>
> = {
  openai: loadOpenAIChatModels,
  ollama: loadOllamaChatModels,
  groq: loadGroqChatModels,
  anthropic: loadAnthropicChatModels,
  gemini: loadGeminiChatModels,
}

export const embeddingModelProviders: Record<
  string,
  () => Promise<Record<string, EmbeddingModel>>
> = {
  openai: loadOpenAIEmbeddingModels,
  ollama: loadOllamaEmbeddingModels,
  gemini: loadGeminiEmbeddingModels,
  transformers: loadTransformersEmbeddingsModels,
}

export const getModelsList = (): ModelsList | null => {
  const modelFile = path.join(process.cwd(), 'data/models.json')
  try {
    const content = fs.readFileSync(modelFile, 'utf-8')
    return JSON.parse(content) as ModelsList
  } catch (err) {
    console.error(`Error reading models file: ${err}`)
    return null
  }
}

export const updateModelsList = (models: ModelsList) => {
  try {
    const modelFile = path.join(process.cwd(), 'data/models.json')
    const content = JSON.stringify(models, null, 2)

    fs.writeFileSync(modelFile, content, 'utf-8')
  } catch(err) {
    console.error(`Error updating models file: ${err}`)
  }
}

export const getAvailableChatModelProviders = async () => {
  const models: Record<string, Record<string, ChatModel>> = {}

  for (const provider in chatModelProviders) {
    const providerModels = await chatModelProviders[provider]()
    if (Object.keys(providerModels).length > 0) {
      models[provider] = providerModels
    }
  }

  const customOpenAiApiKey = getCustomOpenaiApiKey()
  const customOpenAiApiUrl = getCustomOpenaiApiUrl()
  const customOpenAiModelName = getCustomOpenaiModelName()

  models['custom_openai'] = {
    ...(customOpenAiApiKey && customOpenAiApiUrl && customOpenAiModelName
      ? {
          [customOpenAiModelName]: {
            displayName: customOpenAiModelName,
            model: new ChatOpenAI({
              openAIApiKey: customOpenAiApiKey,
              modelName: customOpenAiModelName,
              temperature: 0.7,
              configuration: {
                baseURL: customOpenAiApiUrl,
              },
            }) as unknown as BaseChatModel,
          },
        }
      : {}),
  }

  return models
}

export const getAvailableEmbeddingModelProviders = async () => {
  const models: Record<string, Record<string, EmbeddingModel>> = {}

  for (const provider in embeddingModelProviders) {
    const providerModels = await embeddingModelProviders[provider]()
    if (Object.keys(providerModels).length > 0) {
      models[provider] = providerModels
    }
  }

  return models
}
