type BurialSiteNameSearchType = 'startsWith' | 'endsWith' | '';
interface WhereClauseReturn {
    sqlWhereClause: string;
    sqlParameters: unknown[];
}
export declare function getBurialSiteNameWhereClause(burialSiteName?: string, burialSiteNameSearchType?: BurialSiteNameSearchType, burialSitesTableAlias?: string): WhereClauseReturn;
type ContractTime = '' | 'current' | 'past' | 'future';
export declare function getContractTimeWhereClause(contractTime: ContractTime | undefined, contractsTableAlias?: string): WhereClauseReturn;
export declare function getDeceasedNameWhereClause(deceasedName?: string, tableAlias?: string): WhereClauseReturn;
export {};
