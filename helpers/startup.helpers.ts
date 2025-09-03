import { type ChildProcess, fork } from 'node:child_process'
import path from 'node:path'

import { minutesToMillis } from '@cityssm/to-millis'
import Debug from 'debug'
import exitHook from 'exit-hook'

import { initializeDatabase } from '../database/initializeDatabase.js'
import { DEBUG_NAMESPACE } from '../debug.config.js'
import {
  ntfyIsEnabled,
  sendShutdownNotification,
  sendStartupNotification
} from '../integrations/ntfy/helpers.js'

import { getConfigProperty } from './config.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:helpers:startup:${process.pid}`)

export function isPrimaryProcess(): boolean {
  return process.send === undefined
}

export async function initializeApplication(): Promise<void> {
  /*
   * Initialize the database
   */

  initializeDatabase()

  /*
   * Ensure Puppeteer is installed
   */

  fork('./tasks/puppeteerSetup.task.js', {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    timeout: minutesToMillis(15)
  })

  /*
   * Send the startup ntfy notifications
   */

  if (ntfyIsEnabled) {
    await sendStartupNotification()

    exitHook(() => {
      void sendShutdownNotification()
    })
  }

  /*
   * Start other tasks
   */

  const childProcesses: ChildProcess[] = []

  if (getConfigProperty('integrations.consignoCloud.integrationIsEnabled')) {
    childProcesses.push(
      fork(
        path.join('integrations', 'consignoCloud', 'updateWorkflows.task.js')
      )
    )
  }

  if (getConfigProperty('settings.databaseBackup.taskIsEnabled')) {
    childProcesses.push(fork(path.join('tasks', 'backupDatabase.task.js')))
  }

  if (childProcesses.length > 0) {
    exitHook(() => {
      for (const childProcess of childProcesses) {
        debug(`Killing child process ${childProcess.pid}`)
        childProcess.kill()
      }
    })
  }
}
