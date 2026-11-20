import fs from 'node:fs';
import { debuglog } from 'node:util';
import { gracefulExit } from 'exit-hook';
import { initializeData } from '../../database/initializeDatabase.js';
import updateSetting from '../../database/updateSetting.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { clearCaches } from '../../helpers/cache.helpers.js';
import { getDatabaseConnection } from '../../helpers/database.helpers.js';
import { initializeContractTypePrints } from './data.contractPrints.js';
import { initializeFuneralHomes } from './data.funeralHomes.js';
import { user } from './utilities.js';
const debug = debuglog(`${DEBUG_NAMESPACE}:legacyImportFromCsv`);
function purgeConfigTables() {
    console.time('purgeConfigTables');
    const configTablesToPurge = [
        'CemeteryDirectionsOfArrival',
        'Cemeteries',
        'BurialSiteStatuses',
        'CommittalTypes',
        'ServiceTypes',
        'ContractTypeFields',
        'ContractTypePrints',
        'ContractTypes',
        'IntermentContainerTypes',
        'IntermentDepths',
        'WorkOrderMilestoneTypes',
        'WorkOrderStatuses',
        'WorkOrderTypes'
    ];
    const database = getDatabaseConnection();
    for (const tableName of configTablesToPurge) {
        debug(`Purging table: ${tableName}`);
        database.prepare(`delete from ${tableName}`).run();
        database
            .prepare('delete from sqlite_sequence where name = ?')
            .run(tableName);
    }
    database.close();
    clearCaches();
    initializeData();
    console.timeEnd('purgeConfigTables');
}
function purgeTables() {
    console.time('purgeTables');
    const tablesToPurge = [
        'WorkOrderMilestones',
        'WorkOrderComments',
        'WorkOrderBurialSites',
        'WorkOrderContracts',
        'WorkOrders',
        'ContractAttachments',
        'ContractMetadata',
        'ContractTransactions',
        'ContractFees',
        'ContractFields',
        'ContractComments',
        'ContractInterments',
        'ContractServiceTypes',
        'RelatedContracts',
        'Contracts',
        'FuneralHomes',
        'BurialSiteFields',
        'BurialSiteComments',
        'BurialSites',
        'AuditLog'
    ];
    const database = getDatabaseConnection();
    for (const tableName of tablesToPurge) {
        debug(`Purging table: ${tableName}`);
        database.prepare(`delete from ${tableName}`).run();
        database
            .prepare('delete from sqlite_sequence where name = ?')
            .run(tableName);
    }
    database.close();
    console.timeEnd('purgeTables');
}
function runPostImportSql() {
    const database = getDatabaseConnection();
    const postImportSqlFile = 'temp/postImport.sql';
    const sql = fs.readFileSync(postImportSqlFile, 'utf8');
    database.exec(sql);
    const cityProvinceMappings = JSON.parse(fs.readFileSync('temp/cityProvinceMappings.json', 'utf8'));
    for (const mapping of cityProvinceMappings) {
        database
            .prepare(`
        UPDATE Contracts
        SET
          purchaserProvince = ?
        WHERE
          purchaserCity = ?
          AND purchaserProvince = ''
      `)
            .run(mapping.province, mapping.city);
        database
            .prepare(`
        UPDATE ContractInterments
        SET
          deceasedProvince = ?
        WHERE
          deceasedCity = ?
          AND deceasedProvince = ''
      `)
            .run(mapping.province, mapping.city);
        for (const typo of mapping.typos) {
            database
                .prepare(`
          UPDATE Contracts
          SET
            purchaserCity = ?,
            purchaserProvince = ?
          WHERE
            purchaserCity = ?
            AND (
              purchaserProvince = ?
              OR purchaserProvince = ''
            )
        `)
                .run(mapping.city, mapping.province, typo, mapping.province);
            database
                .prepare(`
          UPDATE ContractInterments
          SET
            deceasedCity = ?,
            deceasedProvince = ?
          WHERE
            deceasedCity = ?
            AND (
              deceasedProvince = ?
              OR deceasedProvince = ''
            )
        `)
                .run(mapping.city, mapping.province, typo, mapping.province);
        }
    }
    database.close();
}
debug(`Started ${new Date().toLocaleString()}`);
console.time('importFromCsv');
purgeTables();
purgeConfigTables();
initializeContractTypePrints(user);
initializeFuneralHomes(user);
updateSetting({
    settingKey: 'defaults.city',
    settingValue: 'Sault Ste. Marie'
});
updateSetting({
    settingKey: 'defaults.province',
    settingValue: 'ON'
});
updateSetting({
    settingKey: 'workOrder.statHolidays.country',
    settingValue: 'CA'
});
updateSetting({
    settingKey: 'workOrder.statHolidays.state',
    settingValue: 'ON'
});
updateSetting({
    settingKey: 'workOrder.statHolidays.types',
    settingValue: 'public,optional'
});
const importFromMasterCSV = await import('./import.master.js');
await importFromMasterCSV.default();
const importFromPrepaidCSV = await import('./import.prepaid.js');
await importFromPrepaidCSV.default();
const importFromWorkOrderCSV = await import('./import.workOrder.js');
await importFromWorkOrderCSV.default();
runPostImportSql();
console.timeEnd('importFromCsv');
debug(`Finished ${new Date().toLocaleString()}`);
gracefulExit();
