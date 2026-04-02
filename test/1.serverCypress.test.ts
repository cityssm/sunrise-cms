/* eslint-disable no-console */

import assert from 'node:assert'
import { exec } from 'node:child_process'
import http from 'node:http'
import { after, before, describe, it } from 'node:test'

import { minutesToMillis } from '@cityssm/to-millis'

import { app, shutdownAbuseCheck } from '../app/app.js'

import { portNumber } from './_globals.js'

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const cypressTimeoutMillis = minutesToMillis(15)

// Record to Cypress Cloud if Node is the selected version. Should match the logging version in coverage.yml
const versionToRecord: `v${number}` = 'v22'

let continueNextRun = true

function runCypress(browser: 'chrome' | 'firefox', done: () => void): void {
  if (!continueNextRun) {
    assert.fail(
      `Skipping Cypress tests in ${browser} due to previous test failures`
    )
  }

  let cypressCommand = `cypress run --config-file cypress.config.js --browser ${browser}`

  if ((process.env.CYPRESS_USE_LONGER_TIMEOUTS ?? '') === 'true') {
    cypressCommand += ' --expose useLongerTimeouts=true'
  }

  if (
    (process.env.CYPRESS_RECORD_KEY ?? '') !== '' &&
    process.version.startsWith(versionToRecord)
  ) {
    cypressCommand += ` --tag "${browser},${process.version},${process.platform}" --record`
  }

  // eslint-disable-next-line security/detect-child-process, sonarjs/os-command
  const childProcess = exec(cypressCommand, {
    env: process.env,
    timeout: cypressTimeoutMillis
  })

  childProcess.stdout?.on('data', (data) => {
    console.log(data)
  })

  childProcess.stderr?.on('data', (data) => {
    console.error(data)
  })

  childProcess.on('error', (error) => {
    continueNextRun = false

    console.error(
      `Error running Cypress: browser=${browser}, error=${
        error instanceof Error ? error.message : String(error)
      }, cmd=${cypressCommand}`
    )

    try {
      assert.fail(
        `Cypress process encountered an error in ${browser}: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    } finally {
      done()
    }
  })

  childProcess.on('exit', (code, signal) => {
    if (code !== 0) {
      continueNextRun = false

      console.error(
        `Cypress failed: browser=${browser}, code=${code}, signal=${signal ?? ''}, cmd=${cypressCommand}`
      )
    }

    assert.strictEqual(
      code,
      0,
      `Cypress tests failed in ${browser} with exit code ${code}, signal ${signal ?? ''}`
    )

    done()
  })
}

await describe('sunrise-cms', async () => {
  // eslint-disable-next-line @typescript-eslint/strict-void-return
  const httpServer = http.createServer(app)

  let serverStarted = false

  before((_context, done) => {
    httpServer.listen(portNumber)

    httpServer.on('error', (error) => {
      serverStarted = false
      console.error('Failed to start HTTP server:', error)
      done(error)
    })

    httpServer.on('listening', () => {
      serverStarted = true
      done()
    })
  })

  after(() => {
    try {
      console.log('Shutting down server...')
      httpServer.close(() => {
        console.log('Server shutdown complete.')
      })
    } catch {
      console.error('Error occurred while shutting down the server.')
    }

    try {
      console.log('Performing abuse check shutdown...')
      shutdownAbuseCheck()
      console.log('Abuse check shutdown complete.')
    } catch {
      console.error('Error occurred while shutting down abuse check.')
    }
  })

  await it(`Ensure server starts on port ${portNumber.toString()}`, () => {
    assert.ok(serverStarted)
  })

  await describe('Cypress tests', async () => {
    await it(
      'Should run Cypress tests in Chrome',
      {
        timeout: cypressTimeoutMillis
      },
      (_context, done) => {
        runCypress('chrome', done)
      }
    )

    if (continueNextRun) {
      await it(
        'Should run Cypress tests in Firefox',
        {
          timeout: cypressTimeoutMillis
        },
        (_context, done) => {
          runCypress('firefox', done)
        }
      )
    }
  })
})
