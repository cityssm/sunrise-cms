import type sqlite from 'better-sqlite3';
import { directionsOfArrival } from '../helpers/dataLists.js';
type DirectionOfArrivalDescriptionKey = `directionOfArrivalDescription_${(typeof directionsOfArrival)[number]}`;
type DirectionOfArrivalKey = `directionOfArrival_${(typeof directionsOfArrival)[number]}`;
export type UpdateCemeteryDirectionsOfArrivalForm = Partial<Record<DirectionOfArrivalDescriptionKey, string>> & Partial<Record<DirectionOfArrivalKey, (typeof directionsOfArrival)[number]>>;
export default function updateCemeteryDirectionsOfArrival(cemeteryId: number | string, updateForm: UpdateCemeteryDirectionsOfArrivalForm, database: sqlite.Database): number;
export {};
