/* eslint-disable no-console, unicorn/filename-case, @eslint-community/eslint-comments/disable-enable-pair */

import assert from 'node:assert'
import { exec } from 'node:child_process'
import http from 'node:http'
import { after, before, describe, it } from 'node:test'

import { hoursToMillis } from '@cityssm/to-millis'

import { app } from '../app.js'

import { portNumber } from './_globals.js'

function runCypress(browser: 'chrome' | 'firefox', done: () => void): void {
  let cypressCommand = `cypress run --config-file cypress.config.js --browser ${browser}`

  if ((process.env.CYPRESS_RECORD_KEY ?? '') !== '') {
    cypressCommand += ` --tag "${browser},${process.version}" --record`
  }

  // eslint-disable-next-line security/detect-child-process, sonarjs/os-command
  const childProcess = exec(cypressCommand)

  childProcess.stdout?.on('data', (data) => {
    console.log(data)
  })

  childProcess.stderr?.on('data', (data) => {
    console.error(data)
  })

  childProcess.on('exit', (code) => {
    assert.ok(code === 0)
    done()
  })
}

await describe('sunrise-cms', async () => {
  const httpServer = http.createServer(app)

  let serverStarted = false

  before(() => {
    httpServer.listen(portNumber)

    httpServer.on('listening', () => {
      serverStarted = true
    })
  })

  after(() => {
    try {
      httpServer.close()
    } catch {
      // ignore
    }
  })

  await it(`Ensure server starts on port ${portNumber.toString()}`, () => {
    assert.ok(serverStarted)
  })

  await describe('Cypress tests', async () => {
    await it(
      'Should run Cypress tests in Chrome',
      {
        timeout: hoursToMillis(1)
      },
      (context, done) => {
        runCypress('chrome', done)
      }
    )

    await it(
      'Should run Cypress tests in Firefox',
      {
        timeout: hoursToMillis(1)
      },
      (context, done) => {
        runCypress('firefox', done)
      }
    )
  })
})
