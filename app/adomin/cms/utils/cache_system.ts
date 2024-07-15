import { DateTime, Duration, DurationLike } from 'luxon'

const CACHE = new Map<string, { expiresAt: DateTime; value: unknown }>()

export const getCacheOrNull = async <T>(key: string): Promise<T | null> => {
  const val = CACHE.get(key)

  if (!val) return null

  if (val.expiresAt < DateTime.now()) {
    CACHE.delete(key)
    return null
  }

  return val.value as T
}

export const getCache = async <T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: DurationLike
): Promise<T> => {
  const val = await getCacheOrNull<T>(key)

  if (val) return val

  const value = await fn()

  const ttlDuration = ttl ?? Duration.fromObject({ minutes: 1 })
  const expiresAt = DateTime.now().plus(ttlDuration)

  CACHE.set(key, { expiresAt, value })

  return value
}

export const clearCache = () => {
  CACHE.clear()
}

export const clearCacheForKey = (...keys: string[]) => {
  keys.forEach((key) => CACHE.delete(key))
}
