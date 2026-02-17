import type { ServiceType } from '../../types/record.types.js';
export declare function getCachedServiceTypeById(serviceTypeId: number): ServiceType | undefined;
export declare function getCachedServiceTypes(): ServiceType[];
export declare function clearServiceTypesCache(): void;
