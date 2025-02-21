import path from 'node:path'

import type { ServiceConfig } from 'node-windows'

const _dirname = '.'

export const serviceConfig: ServiceConfig = {
  name: 'Sunrise CMS',
  description:
    'Sunrise Cemetery Management System, a web-based application that allows cemetery managers to manage their cemetery records.',
  script: path.join(_dirname, 'bin', 'www.js')
}
