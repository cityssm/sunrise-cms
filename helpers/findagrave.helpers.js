import { getFindAGraveCemeteryUrl as _getFindAGraveCemeteryUrl, getFindAGraveMemorialSearchUrl as _getFindAGraveMemorialSearchUrl, getFindAGraveMemorialUrl as _getFindAGraveMemorialUrl, parseFullName } from '@cityssm/cemetery-utils';
import { partialDateIntegerToYear } from './partialDate.helpers.js';
export function getFindAGraveCemeteryUrl(findAGraveCemeteryId) {
    return findAGraveCemeteryId === null
        ? undefined
        : _getFindAGraveCemeteryUrl(findAGraveCemeteryId);
}
export function getFindAGraveMemorialUrl(findAGraveMemorialId) {
    return findAGraveMemorialId === null
        ? undefined
        : _getFindAGraveMemorialUrl(findAGraveMemorialId);
}
export function getFindAGraveMemorialSearchUrl(findagraveCemeteryId, deceasedName, birthDate, deathDate) {
    if (findagraveCemeteryId === null || deceasedName.trim().length === 0) {
        return undefined;
    }
    const birthYear = birthDate === null ? undefined : partialDateIntegerToYear(birthDate);
    const deathYear = deathDate === null ? undefined : partialDateIntegerToYear(deathDate);
    return _getFindAGraveMemorialSearchUrl(findagraveCemeteryId, parseFullName(deceasedName, { doFirstNameCheck: true }), {
        birthYear,
        deathYear
    });
}
