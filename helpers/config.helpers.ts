import { Configurator } from '@cityssm/configurator'
import { secondsToMillis } from '@cityssm/to-millis'

import { config } from '../data/config.js'
import { configDefaultValues } from '../data/configDefaults.js'

const configurator = new Configurator(
  configDefaultValues,
  config as unknown as Record<string, unknown>
)

export function getConfigProperty<K extends keyof typeof configDefaultValues>(
  propertyName: K,
  fallbackValue?: (typeof configDefaultValues)[K]
): (typeof configDefaultValues)[K] {
  return configurator.getConfigProperty(
    propertyName,
    fallbackValue
  ) as (typeof configDefaultValues)[K]
}

export default {
  getConfigProperty
}

export const keepAliveMillis = getConfigProperty('session.doKeepAlive')
  ? Math.max(
      getConfigProperty('session.maxAgeMillis') / 2,
      getConfigProperty('session.maxAgeMillis') - secondsToMillis(10)
    )
  : 0
