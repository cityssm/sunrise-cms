import type { CommittalType } from '../../types/record.types.js';
export declare function getCachedCommittalTypeById(committalTypeId: number): CommittalType | undefined;
export declare function getCachedCommittalTypes(): CommittalType[];
export declare function clearCommittalTypesCache(): void;
