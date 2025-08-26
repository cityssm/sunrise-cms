import sqlite from 'better-sqlite3';
export interface FuneralDirectorSuggestion {
    funeralDirectorName: string;
    usageCount: number;
}
export default function getFuneralDirectorsByFuneralHomeId(funeralHomeId: number | string, connectedDatabase?: sqlite.Database): FuneralDirectorSuggestion[];
