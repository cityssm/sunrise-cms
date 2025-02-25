import type { Cemetery } from '../types/recordTypes.js';
export default function getCemetery(cemeteryId: number | string): Promise<Cemetery | undefined>;
