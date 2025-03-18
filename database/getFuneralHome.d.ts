import type { FuneralHome } from '../types/recordTypes.js';
export default function getFuneralHome(funeralHomeId: number | string): Promise<FuneralHome | undefined>;
export declare function getFuneralHomeByKey(funeralHomeKey: string): Promise<FuneralHome | undefined>;
