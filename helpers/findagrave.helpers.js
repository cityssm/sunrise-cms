import humanNames from 'human-names';
import { parseFullName } from 'parse-full-name';
import { UNISEX } from 'wikidata-person-names';
import { partialDateIntegerToYear } from './partialDate.helpers.js';
const firstNames = new Set([
    ...humanNames.allEn.map((v) => v.toLowerCase()),
    ...humanNames.allIt.map((v) => v.toLowerCase()),
    ...humanNames.allFr.map((v) => v.toLowerCase()),
    ...humanNames.allDe.map((v) => v.toLowerCase()),
    ...humanNames.allEs.map((v) => v.toLowerCase()),
    ...humanNames.allNl.map((v) => v.toLowerCase()),
    ...UNISEX.map((v) => v.toLowerCase())
]);
export function getFindagraveCemeteryUrl(findagraveCemeteryId) {
    if (findagraveCemeteryId === null) {
        return undefined;
    }
    return `https://www.findagrave.com/cemetery/${findagraveCemeteryId}`;
}
export function getFindagraveMemorialUrl(findagraveMemorialId) {
    if (findagraveMemorialId === null) {
        return undefined;
    }
    return `https://www.findagrave.com/memorial/${findagraveMemorialId}`;
}
export function getFindagraveMemorialSearchUrl(findagraveCemeteryId, deceasedName, birthDate, deathDate) {
    const parameters = new URLSearchParams();
    if (findagraveCemeteryId === null) {
        return undefined;
    }
    const parsedName = parseFullName(deceasedName);
    let firstName = parsedName.first ?? '';
    const middleName = parsedName.middle ?? '';
    let lastName = parsedName.last ?? '';
    if (firstNames.has(lastName.toLowerCase()) &&
        !firstNames.has(firstName.toLowerCase())) {
        lastName = firstName;
        firstName = middleName || (parsedName.last ?? '');
    }
    parameters.append('firstname', firstName);
    parameters.append('lastname', lastName);
    if (birthDate !== null) {
        const birthYear = partialDateIntegerToYear(birthDate);
        parameters.append('birthyear', birthYear?.toString() ?? '');
    }
    if (deathDate !== null) {
        const deathYear = partialDateIntegerToYear(deathDate);
        parameters.append('deathyear', deathYear?.toString() ?? '');
    }
    return `https://www.findagrave.com/cemetery/${findagraveCemeteryId}/memorial-search?${parameters.toString()}`;
}
