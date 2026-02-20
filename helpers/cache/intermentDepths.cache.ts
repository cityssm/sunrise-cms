import getIntermentDepthsFromDatabase from '../../database/getIntermentDepths.js'
import type { IntermentDepth } from '../../types/record.types.js'

let intermentDepths: IntermentDepth[] | undefined

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
  intermentDepths ??= getIntermentDepthsFromDatabase()
  return intermentDepths
}

export function clearIntermentDepthsCache(): void {
  intermentDepths = undefined
}
