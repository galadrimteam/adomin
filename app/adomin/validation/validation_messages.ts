import { ApiStatFilters } from "#adomin/api_stat_filter.types"
import { DEFAULT_MESSAGE_PROVIDER_CONFIG } from "#adomin/cms/utils/validation"
import { SimpleMessagesProvider } from "@vinejs/vine"

export const getMessagesProviderForAdominFields = (filters: ApiStatFilters): SimpleMessagesProvider => {
  const labels = Object.keys(filters).reduce((acc, key) => {
    acc[key] = filters[key].label ?? key

    return acc
  }, {} as Record<string, string>)

  const messagesProvider = new SimpleMessagesProvider(DEFAULT_MESSAGE_PROVIDER_CONFIG, labels)

  return messagesProvider
}
