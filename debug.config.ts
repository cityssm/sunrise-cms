import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_CONSIGNO_CLOUD } from '@cityssm/consigno-cloud-api/debug'

export const DEBUG_NAMESPACE = 'sunrise'

export const DEBUG_ENABLE_NAMESPACES = [
  `${DEBUG_NAMESPACE}:*`,
  DEBUG_ENABLE_NAMESPACES_CONSIGNO_CLOUD
].join(',')

export const PROCESS_ID_MAX_DIGITS = 5
