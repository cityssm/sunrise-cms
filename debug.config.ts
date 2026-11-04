import hasPackage from '@cityssm/has-package'

export const DEBUG_NAMESPACE = 'sunrise-cms'

const DEBUG_ENABLE_NAMESPACES_ARRAY = [`${DEBUG_NAMESPACE}:`]

if (await hasPackage('@cityssm/consigno-cloud-api')) {
  const { DEBUG_ENABLE_NAMESPACES: DEBUG_ENABLE_NAMESPACES_CONSIGNO_CLOUD } =
    await import('@cityssm/consigno-cloud-api/debug')

  DEBUG_ENABLE_NAMESPACES_ARRAY.push(DEBUG_ENABLE_NAMESPACES_CONSIGNO_CLOUD)
}

export const DEBUG_ENABLE_NAMESPACES = DEBUG_ENABLE_NAMESPACES_ARRAY.join(',')
