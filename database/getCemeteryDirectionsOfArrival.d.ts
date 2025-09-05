import sqlite from 'better-sqlite3';
import type { directionsOfArrival } from '../helpers/dataLists.js';
export default function getCemeteryDirectionsOfArrival(cemeteryId: number | string, connectedDatabase?: sqlite.Database): Partial<Record<(typeof directionsOfArrival)[number], string>>;
