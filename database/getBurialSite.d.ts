import type { Lot } from '../types/recordTypes.js';
export declare function getLotByLotName(lotName: string): Promise<Lot | undefined>;
export default function getLot(burialSiteId: number | string): Promise<Lot | undefined>;
