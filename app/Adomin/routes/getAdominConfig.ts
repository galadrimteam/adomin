import { ADOMIN_CONFIG } from 'App/Adomin/CONFIG'

const defaultText = 'Made with ❤️ by Galadrim'

export const getAdominConfig = () => {
  const models = ADOMIN_CONFIG.models.map((conf) => {
    const { label, labelPluralized, name } = conf

    return {
      label,
      labelPluralized,
      model: name,
    }
  })

  const footerText = ADOMIN_CONFIG.footerText ?? defaultText

  return { title: ADOMIN_CONFIG.title, footerText, models }
}
