import type { WorkOrderType } from '../../types/record.types.js';
export declare function getCachedWorkOrderTypeById(workOrderTypeId: number): WorkOrderType | undefined;
export declare function getCachedWorkOrderTypes(): WorkOrderType[];
export declare function clearWorkOrderTypesCache(): void;
