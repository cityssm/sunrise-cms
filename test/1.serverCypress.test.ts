/* eslint-disable no-console */
/* eslint-disable promise/avoid-new */

import assert from 'node:assert'
import { type ChildProcess, spawn } from 'node:child_process'
import { after, before, describe, it } from 'node:test'

import {
  millisecondsInOneHour,
  millisecondsInOneMinute,
  minutesToMillis
} from '@cityssm/to-millis'

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
    const childProcess = spawn(
      process.platform === 'win32' ? 'npx.cmd' : 'npx',
      ['cypress', ...cypressCommandArguments],
      {
        env: process.env,
        shell: process.platform === 'win32' ? true : undefined
      }
    )

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
    let appProcess: ChildProcess | undefined

    let serverStarted = false

    before(async () => {
      console.log('Starting server...')

      await new Promise<void>((resolve, reject) => {
        // eslint-disable-next-line sonarjs/no-os-command-from-path
        appProcess = spawn('node', ['./index.js'], {
          detached: true,
          env: process.env,
          shell: process.platform === 'win32' ? true : undefined
        })

        appProcess.stdout?.setEncoding('utf8')
        appProcess.stdout?.on('data', (data) => {
          process.stdout.write(`server stdout: ${data}`)
        })

        appProcess.stderr?.setEncoding('utf8')
        appProcess.stderr?.on('data', (data) => {
          process.stderr.write(`server stderr: ${data}`)

          if (!serverStarted && data.includes('HTTP Listening on')) {
            serverStarted = true
            console.log('Server started successfully.')

            resolve()
          }
        })

        appProcess.on('error', (error) => {
          reject(error instanceof Error ? error : new Error(String(error)))
        })

        appProcess.on('close', (code, signal) => {
          if (code !== 0) {
            reject(
              new Error(
                `Server process exited with code=${code}, signal=${signal ?? ''}`
              )
            )
            return
          }

          resolve()
        })
      })
    })

    after(
      async () => {
        console.log('Stopping server...')

        if (appProcess !== undefined) {
          await new Promise<void>((resolve) => {
            console.log('Calling unref...')
            appProcess?.unref()
            console.log('Unref called.')

            console.log('Calling kill...')
            appProcess?.kill()
            console.log('Kill called.')

            console.log('Server stopped.')
            resolve()
          })
        }
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
