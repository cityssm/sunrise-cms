type BurialSiteNameSearchType = '' | 'endsWith' | 'startsWith';
type ContractTime = '' | 'current' | 'future' | 'past';
interface WhereClauseReturn {
    sqlParameters: unknown[];
    sqlWhereClause: string;
}
export declare function getBurialSiteNameWhereClause(burialSiteName?: string, burialSiteNameSearchType?: BurialSiteNameSearchType, burialSitesTableAlias?: string): WhereClauseReturn;
export declare function getContractTimeWhereClause(contractTime: ContractTime | undefined, contractsTableAlias?: string): WhereClauseReturn;
export declare function getDeceasedNameWhereClause(deceasedName?: string, tableAlias?: string): WhereClauseReturn;
export {};
