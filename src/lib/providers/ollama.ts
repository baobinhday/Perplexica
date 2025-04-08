import axios from 'axios'
import { getKeepAlive, getOllamaApiEndpoint } from '../config'
import { ChatModel, EmbeddingModel } from '.'
import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama'

const loadModels = async (apiURL: string) => {
  try {
    const res = await axios.get(`${apiURL}/api/tags`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (res.status !== 200) {
      console.error(`Failed to load Ollama models: ${res.data}`)
      return []
    }

    const { models } = res.data

    return models
  } catch (err) {
    console.error(`Error loading Ollama models: ${err}`)
    return []
  }
}

export const loadOllamaChatModels = async () => {
  const ollamaApiEndpoint = getOllamaApiEndpoint()
  if (!ollamaApiEndpoint) return {}

  const models = await loadModels(ollamaApiEndpoint)

  try {
    const chatModels: Record<string, ChatModel> = {}

    models.forEach((model: any) => {
      chatModels[model.model] = {
        displayName: model.name,
        model: new ChatOllama({
          baseUrl: ollamaApiEndpoint,
          model: model.model,
          temperature: 0.7,
          keepAlive: getKeepAlive(),
        }),
      }
    })

    return chatModels
  } catch (err) {
    console.error(`Error loading Ollama models: ${err}`)
    return {}
  }
}

export const loadOllamaEmbeddingModels = async () => {
  const ollamaApiEndpoint = getOllamaApiEndpoint()
  if (!ollamaApiEndpoint) return {}

  const models = await loadModels(ollamaApiEndpoint)

  try {
    const embeddingModels: Record<string, EmbeddingModel> = {}

    models.forEach((model: any) => {
      embeddingModels[model.model] = {
        displayName: model.name,
        model: new OllamaEmbeddings({
          baseUrl: ollamaApiEndpoint,
          model: model.model,
        }),
      }
    })

    return embeddingModels
  } catch (err) {
    console.error(`Error loading Ollama embeddings models: ${err}`)
    return {}
  }
}
