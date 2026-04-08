/* eslint-disable no-console */
/* eslint-disable promise/avoid-new */

import assert from 'node:assert'
import { spawn } from 'node:child_process'
import http from 'node:http'
import { after, before, describe, it } from 'node:test'

import {
  millisecondsInOneHour,
  millisecondsInOneMinute,
  minutesToMillis
} from '@cityssm/to-millis'

import { app, closePdfPuppeteer, shutdownAbuseCheck } from '../app/app.js'

import { portNumber } from './_globals.js'

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const cypressTimeoutMillis = minutesToMillis(15)

// Record to Cypress Cloud if Node is the selected version. Should match the logging version in coverage.yml
const versionToRecord: `v${number}` = 'v22'

let continueNextRun = true

async function runCypress(browser: 'chrome' | 'firefox'): Promise<void> {
  if (!continueNextRun) {
    assert.fail(
      `Skipping Cypress tests in ${browser} due to previous test failures`
    )
  }

  const cypressCommandArguments = [
    'run',

    '--config-file',
    'cypress.config.js',

    '--browser',
    browser,

    '--reporter',
    'spec'
  ]

  if ((process.env.CYPRESS_USE_LONGER_TIMEOUTS ?? '') === 'true') {
    cypressCommandArguments.push('--expose', 'useLongerTimeouts=true')
  }

  if (
    (process.env.CYPRESS_RECORD_KEY ?? '') !== '' &&
    process.version.startsWith(versionToRecord)
  ) {
    cypressCommandArguments.push(
      '--tag',
      `${browser},${process.version},${process.platform}`,

      '--record'
    )
  }

  await new Promise<void>((resolve, reject) => {
    // eslint-disable-next-line sonarjs/no-os-command-from-path
    const childProcess = spawn('npx', ['cypress', ...cypressCommandArguments], {
      env: process.env
    })

    childProcess.stdout.setEncoding('utf8')
    childProcess.stdout.on('data', (data) => {
      process.stdout.write(data)
    })

    childProcess.stderr.setEncoding('utf8')
    childProcess.stderr.on('data', (data) => {
      process.stderr.write(data)
    })

    const timeout = setTimeout(() => {
      continueNextRun = false
      childProcess.kill('SIGKILL')

      reject(
        new Error(
          `Cypress timed out in ${browser} after ${cypressTimeoutMillis}ms`
        )
      )
    }, cypressTimeoutMillis)

    childProcess.on('error', (error) => {
      clearTimeout(timeout)

      continueNextRun = false

      reject(error instanceof Error ? error : new Error(String(error)))
    })

    childProcess.on('close', (code, signal) => {
      clearTimeout(timeout)

      if (code !== 0) {
        continueNextRun = false
        reject(
          new Error(
            `Cypress failed in ${browser}: code=${code}, signal=${signal ?? ''}`
          )
        )
        return
      }

      resolve()
    })
  })
}

await describe(
  'sunrise-cms',
  {
    timeout: millisecondsInOneHour
  },
  async () => {
    // eslint-disable-next-line @typescript-eslint/strict-void-return
    const httpServer = http.createServer(app)

    let serverStarted = false

    before(async () => {
      await new Promise<void>((resolve, reject) => {
        httpServer.listen(portNumber)

        httpServer.on('error', reject)

        httpServer.on('listening', () => {
          serverStarted = true
          resolve()
        })
      })
    })

    after(
      async () => {
        console.log('Shutting down server...')

        await new Promise<void>((resolve) => {
          httpServer.close(() => {
            console.log('HTTP server closed.')
            resolve()
          })
        })
        httpServer.closeAllConnections()

        console.log('Server closed all connections.')

        console.log('Performing abuse check shutdown...')
        shutdownAbuseCheck()
        console.log('Abuse check shutdown complete.')

        console.log('Performing PDF Puppeteer shutdown...')
        await closePdfPuppeteer()
        console.log('PDF Puppeteer shutdown complete.')
      },
      {
        timeout: millisecondsInOneMinute
      }
    )

    await it(`Ensure server starts on port ${portNumber.toString()}`, () => {
      assert.ok(serverStarted)
    })

    await it(
      'Should run Cypress tests in Chrome',
      {
        timeout: cypressTimeoutMillis
      },
      async () => {
        await runCypress('chrome')
      }
    )

    if (continueNextRun) {
      await it(
        'Should run Cypress tests in Firefox',
        {
          timeout: cypressTimeoutMillis
        },
        async () => {
          await runCypress('firefox')
        }
      )
    }
  }
)
