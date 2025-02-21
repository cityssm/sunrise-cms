import cluster from 'node:cluster';
import Debug from 'debug';
import NodeCache from 'node-cache';
import getNextBurialSiteIdFromDatabase from '../database/getNextBurialSiteId.js';
import getPreviousLotIdFromDatabase from '../database/getPreviousLotId.js';
import { DEBUG_NAMESPACE } from '../debug.config.js';
const debug = Debug(`${DEBUG_NAMESPACE}:burialSites.helpers:${process.pid}`);
const cacheOptions = {
    stdTTL: 2 * 60, // two minutes
    useClones: false
};
const previousBurialSiteIdCache = new NodeCache(cacheOptions);
const nextBurialSiteIdCache = new NodeCache(cacheOptions);
function cacheBurialSiteIds(burialSiteId, nextBurialSiteId, relayMessage = true) {
    previousBurialSiteIdCache.set(nextBurialSiteId, burialSiteId);
    nextBurialSiteIdCache.set(burialSiteId, nextBurialSiteId);
    try {
        if (relayMessage && cluster.isWorker && process.send !== undefined) {
            const workerMessage = {
                messageType: 'cacheBurialSiteIds',
                burialSiteId,
                nextBurialSiteId,
                timeMillis: Date.now(),
                pid: process.pid
            };
            debug(`Sending cache burial site ids from worker: (${burialSiteId}, ${nextBurialSiteId})`);
            process.send(workerMessage);
        }
    }
    catch { }
}
export async function getNextBurialSiteId(burialSiteId) {
    let nextBurialSiteId = nextBurialSiteIdCache.get(burialSiteId);
    if (nextBurialSiteId === undefined) {
        nextBurialSiteId = await getNextBurialSiteIdFromDatabase(burialSiteId);
        if (nextBurialSiteId !== undefined) {
            cacheBurialSiteIds(burialSiteId, nextBurialSiteId);
        }
    }
    return nextBurialSiteId;
}
export async function getPreviousBurialSiteId(burialSiteId) {
    let previousBurialSiteId = previousBurialSiteIdCache.get(burialSiteId);
    if (previousBurialSiteId === undefined) {
        previousBurialSiteId = await getPreviousLotIdFromDatabase(burialSiteId);
        if (previousBurialSiteId !== undefined) {
            cacheBurialSiteIds(previousBurialSiteId, burialSiteId);
        }
    }
    return previousBurialSiteId;
}
export function clearNextPreviousBurialSiteIdCache(burialSiteId = -1, relayMessage = true) {
    if (burialSiteId === -1) {
        previousBurialSiteIdCache.flushAll();
        nextBurialSiteIdCache.flushAll();
        return;
    }
    const previousBurialSiteId = previousBurialSiteIdCache.get(burialSiteId);
    if (previousBurialSiteId !== undefined) {
        nextBurialSiteIdCache.del(previousBurialSiteId);
        previousBurialSiteIdCache.del(burialSiteId);
    }
    const nextBurialSiteId = nextBurialSiteIdCache.get(burialSiteId);
    if (nextBurialSiteId !== undefined) {
        previousBurialSiteIdCache.del(nextBurialSiteId);
        nextBurialSiteIdCache.del(burialSiteId);
    }
    try {
        if (relayMessage && cluster.isWorker && process.send !== undefined) {
            const workerMessage = {
                // eslint-disable-next-line no-secrets/no-secrets
                messageType: 'clearNextPreviousBurialSiteIdCache',
                burialSiteId,
                timeMillis: Date.now(),
                pid: process.pid
            };
            debug(`Sending clear next/previous burial site cache from worker: ${burialSiteId}`);
            process.send(workerMessage);
        }
    }
    catch { }
}
process.on('message', (message) => {
    if (message.pid !== process.pid) {
        switch (message.messageType) {
            case 'cacheBurialSiteIds': {
                debug(`Caching burial site ids: (${message.burialSiteId}, ${message.nextBurialSiteId})`);
                cacheBurialSiteIds(message.burialSiteId, message.nextBurialSiteId, false);
                break;
            }
            // eslint-disable-next-line no-secrets/no-secrets
            case 'clearNextPreviousBurialSiteIdCache': {
                debug(`Clearing next/previous burial site cache: ${message.burialSiteId}`);
                clearNextPreviousBurialSiteIdCache(message.burialSiteId, false);
                break;
            }
        }
    }
});
