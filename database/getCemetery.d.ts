import type { Cemetery } from '../types/recordTypes.js';
export default function getMap(cemeteryId: number | string): Promise<Cemetery | undefined>;
