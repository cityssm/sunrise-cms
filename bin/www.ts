import cluster, { type Worker } from 'node:cluster'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { secondsToMillis } from '@cityssm/to-millis'
import Debug from 'debug'
import exitHook, { gracefulExit } from 'exit-hook'

import { DEBUG_NAMESPACE } from '../debug.config.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { initializeApplication } from '../helpers/startup.helpers.js'
import type { WorkerMessage } from '../types/application.types.js'
import version from '../version.js'

const debug = Debug(`${DEBUG_NAMESPACE}:www:${process.pid}`)

// INITIALIZE THE APPLICATION
await initializeApplication()

const directoryName = path.dirname(fileURLToPath(import.meta.url))

const processCount = Math.min(
  getConfigProperty('application.maximumProcesses'),
  os.cpus().length * 2
)

const applicationName = getConfigProperty('application.applicationName')

process.title = `${applicationName} (Primary)`

debug(`Primary pid:   ${process.pid}`)
debug(`Primary title: ${process.title}`)
debug(`Version:       ${version}`)
debug(`Launching ${processCount} processes`)

/*
 * Set up the cluster
 */

const clusterSettings = {
  exec: `${directoryName}/wwwProcess.js`
}

cluster.setupPrimary(clusterSettings)

let doShutdown = false
const activeWorkers = new Map<number, Worker>()

for (let index = 0; index < processCount; index += 1) {
  const worker = cluster.fork()
  activeWorkers.set(worker.process.pid ?? 0, worker)
}

cluster.on('message', (worker, message: WorkerMessage) => {
  for (const [pid, activeWorker] of activeWorkers.entries()) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (activeWorker === undefined || pid === message.pid) {
      continue
    }

    debug(`Relaying message to worker: ${pid}`)
    activeWorker.send(message)
  }
})

cluster.on('exit', (worker) => {
  debug(`Worker ${(worker.process.pid ?? 0).toString()} has been killed`)
  activeWorkers.delete(worker.process.pid ?? 0)

  if (!doShutdown) {
    debug('Starting another worker')
    const newWorker = cluster.fork()

    activeWorkers.set(newWorker.process.pid ?? 0, newWorker)
  }
})

/*
 * Set up the exit hook
 */

exitHook(() => {
  doShutdown = true
  debug('Shutting down cluster workers...')

  for (const worker of activeWorkers.values()) {
    debug(`Killing worker ${worker.process.pid}`)
    worker.kill()
  }
})

/*
 * Set up the startup test
 */

if (process.env.STARTUP_TEST === 'true') {
  const killSeconds = 10

  debug(`Killing processes in ${killSeconds} seconds...`)

  setTimeout(() => {
    debug('Killing processes')

    doShutdown = true

    gracefulExit(0)
  }, secondsToMillis(killSeconds))
}
