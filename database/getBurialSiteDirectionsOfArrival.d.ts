import sqlite from 'better-sqlite3';
import type { directionsOfArrival } from '../helpers/dataLists.js';
export declare const defaultDirectionsOfArrival: {
    E: string;
    N: string;
    S: string;
    W: string;
};
export default function getBurialSiteDirectionsOfArrival(burialSiteId: number | string, connectedDatabase?: sqlite.Database): Partial<Record<(typeof directionsOfArrival)[number], string>>;
