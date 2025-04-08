import { EmbeddingModel, getModelsList, RawModel } from '.'
import { HuggingFaceTransformersEmbeddings } from '../huggingfaceTransformer'

const loadModels = () => {
  return getModelsList()?.embeddingModels[
    'transformers'
  ] as unknown as RawModel[]
}

export const loadTransformersEmbeddingsModels = async () => {
  try {
    const models = loadModels()

    const embeddingModels: Record<string, EmbeddingModel> = {}

    models.forEach(model => {
      embeddingModels[model.key] = {
        displayName: model.displayName,
        model: new HuggingFaceTransformersEmbeddings({
          modelName: model.key,
        }),
      }
    })

    return embeddingModels
  } catch (err) {
    console.error(`Error loading Transformers embeddings model: ${err}`)
    return {}
  }
}
