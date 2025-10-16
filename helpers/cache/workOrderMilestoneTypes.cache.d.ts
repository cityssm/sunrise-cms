import type { WorkOrderMilestoneType } from '../../types/record.types.js';
export declare function getCachedWorkOrderMilestoneTypeById(workOrderMilestoneTypeId: number): WorkOrderMilestoneType | undefined;
export declare function getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType(workOrderMilestoneTypeString: string, includeDeleted?: boolean): WorkOrderMilestoneType | undefined;
export declare function getCachedWorkOrderMilestoneTypes(includeDeleted?: boolean): WorkOrderMilestoneType[];
export declare function clearWorkOrderMilestoneTypesCache(): void;
