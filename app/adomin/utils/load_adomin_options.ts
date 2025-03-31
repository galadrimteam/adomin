import { AdominEnumFieldConfig } from "#adomin/fields.types"

export const loadAdominOptions = async (options: AdominEnumFieldConfig['options']) => {
  if (typeof options === 'function') return options()

  return options
}
