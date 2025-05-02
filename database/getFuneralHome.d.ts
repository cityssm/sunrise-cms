import type { FuneralHome } from '../types/record.types.js';
export default function getFuneralHome(funeralHomeId: number | string, includeDeleted?: boolean): FuneralHome | undefined;
export declare function getFuneralHomeByKey(funeralHomeKey: string, includeDeleted?: boolean): FuneralHome | undefined;
