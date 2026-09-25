import getIntermentDepthsFromDatabase from '../../database/getIntermentDepths.js'
import type { IntermentDepth } from '../../types/record.types.js'

const cache: {
  intermentDepths: IntermentDepth[] | undefined
} = {
  intermentDepths: undefined
}

export function getCachedIntermentDepthById(
  intermentDepthId: number
): IntermentDepth | undefined {
  const cachedIntermentDepths = getCachedIntermentDepths()

  return cachedIntermentDepths.find(
    (currentIntermentDepth) =>
      currentIntermentDepth.intermentDepthId === intermentDepthId
  )
}

export function getCachedIntermentDepths(): IntermentDepth[] {
  cache.intermentDepths ??= getIntermentDepthsFromDatabase()
  return cache.intermentDepths
}

export function clearIntermentDepthsCache(): void {
  cache.intermentDepths = undefined
}
