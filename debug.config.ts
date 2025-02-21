import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_DYNAMICS } from '@cityssm/dynamics-gp/debug'

export const DEBUG_NAMESPACE = 'sunrise'

export const DEBUG_ENABLE_NAMESPACES = [
  `${DEBUG_NAMESPACE}:*`,
  DEBUG_ENABLE_NAMESPACES_DYNAMICS
].join(',')
