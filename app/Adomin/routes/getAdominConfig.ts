import { string } from '@ioc:Adonis/Core/Helpers'
import { ADOMIN_CONFIG } from 'App/Adomin/CONFIG'

export const getAdominConfig = () => {
  const models = ADOMIN_CONFIG.models.map((conf) => {
    const Model = conf.model()
    const label = conf.label ?? Model.name
    const labelPluralized = conf.labelPluralized ?? string.pluralize(label)

    return {
      label,
      labelPluralized,
      model: Model.name,
    }
  })

  return { title: ADOMIN_CONFIG.title, models }
}
