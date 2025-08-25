export interface BurialSiteInterment {
    burialSiteId: number;
    deceasedNames: string[];
}
export default function getBurialSiteInterments(burialSiteIds: number[]): BurialSiteInterment[];
