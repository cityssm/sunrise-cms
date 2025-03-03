import { config as baseConfig } from './config.base.js'

export const config = Object.assign({}, baseConfig)

config.settings.provinceDefault = 'ON'

config.settings.fees.taxPercentageDefault = 13

export default config
