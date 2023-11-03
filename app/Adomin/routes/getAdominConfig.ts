import { string } from '@ioc:Adonis/Core/Helpers'
import { ADOMIN_CONFIG } from 'App/Adomin/CONFIG'

const defaultText = 'Made with ❤️ by Galadrim'

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

  const footerText = ADOMIN_CONFIG.footerText ?? defaultText

  return { title: ADOMIN_CONFIG.title, footerText, models }
}
