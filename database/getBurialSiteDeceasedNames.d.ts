export interface BurialSiteDeceasedNames {
    burialSiteId: number;
    deceasedNames: string[];
}
export default function getBurialSiteDeceasedNames(burialSiteIds: number[]): BurialSiteDeceasedNames[];
