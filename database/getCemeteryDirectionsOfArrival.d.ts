import sqlite from 'better-sqlite3';
import type { directionsOfArrival } from '../data/dataLists.js';
export default function getCemeteryDirectionsOfArrival(cemeteryId: number | string, connectedDatabase?: sqlite.Database): Partial<Record<(typeof directionsOfArrival)[number], string>>;
