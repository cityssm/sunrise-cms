import type sqlite from 'better-sqlite3';
import { directionsOfArrival } from '../data/dataLists.js';
export type UpdateCemeteryDirectionsOfArrivalForm = Partial<Record<`directionOfArrival_${(typeof directionsOfArrival)[number]}`, (typeof directionsOfArrival)[number]>> & Partial<Record<`directionOfArrivalDescription_${(typeof directionsOfArrival)[number]}`, string>>;
export default function updateCemeteryDirectionsOfArrival(cemeteryId: number | string, updateForm: UpdateCemeteryDirectionsOfArrivalForm, database: sqlite.Database): number;
