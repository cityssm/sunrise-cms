import sqlite from 'better-sqlite3';
export default function getFuneralDirectorNamesByFuneralHomeId(funeralHomeId: number | string, connectedDatabase?: sqlite.Database): string[];
