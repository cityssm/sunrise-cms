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
    return currentVersion;
}
