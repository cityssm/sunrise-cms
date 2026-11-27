import { getCurrentUserVersion } from './helpers.js';
export default async function upgradeDatabase(database) {
    let currentVersion = getCurrentUserVersion(database);
    if (currentVersion < 1) {
        const upgradeToVersion1 = await import('./upgradeToVersion1.js');
        currentVersion = upgradeToVersion1.default(database);
    }
    if (currentVersion < 2) {
        const upgradeToVersion2 = await import('./upgradeToVersion2.js');
        currentVersion = upgradeToVersion2.default(database);
    }
    if (currentVersion < 3) {
        const upgradeToVersion3 = await import('./upgradeToVersion3.js');
        currentVersion = upgradeToVersion3.default(database);
    }
    if (currentVersion < 4) {
        const upgradeToVersion4 = await import('./upgradeToVersion4.js');
        currentVersion = upgradeToVersion4.default(database);
    }
    return currentVersion;
}
