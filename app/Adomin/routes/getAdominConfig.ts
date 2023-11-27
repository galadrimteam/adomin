import { ADOMIN_CONFIG } from 'App/Adomin/CONFIG'

const defaultText = 'Made with ❤️ by Galadrim'

export const getAdominConfig = () => {
  const models = ADOMIN_CONFIG.models.map((conf) => {
    const { label, labelPluralized, name, isHidden } = conf

    return {
      label,
      labelPluralized,
      model: name,
      isHidden: isHidden ?? false,
    }
  })

  const footerText = ADOMIN_CONFIG.footerText ?? defaultText

  return { title: ADOMIN_CONFIG.title, footerText, models }
}
