import Debug from 'debug';
import { lotOccupancyDB as databasePath } from '../data/databasePaths.js';
import { initializeDatabase } from './initializer.database.js';
import { addLotOccupantType } from './lotOccupancyDB/addLotOccupantType.js';
import { addOccupancyTypeField } from './lotOccupancyDB/addOccupancyTypeField.js';
import { addRecord } from './lotOccupancyDB/addRecord.js';
const debug = Debug('lot-occupancy-system:initialize');
const user = {
    userName: 'init.cemetery',
    userProperties: {
        canUpdate: true,
        isAdmin: true,
        apiKey: ''
    }
};
export async function initializeCemeteryDatabase() {
    debug('Checking for ' + databasePath + '...');
    const databaseInitialized = initializeDatabase();
    if (!databaseInitialized) {
        debug('Database already created.\n' +
            'To initialize this database with cemetery types, delete the database file first, then rerun this script.');
        return false;
    }
    debug('New database file created.  Proceeding with initialization.');
    await addRecord('LotTypes', 'Casket Grave', 1, user);
    await addRecord('LotTypes', 'Columbarium', 2, user);
    await addRecord('LotTypes', 'Mausoleum', 2, user);
    await addRecord('LotTypes', 'Niche Wall', 2, user);
    await addRecord('LotTypes', 'Urn Garden', 2, user);
    await addRecord('LotTypes', 'Crematorium', 2, user);
    await addRecord('LotStatuses', 'Available', 1, user);
    await addRecord('LotStatuses', 'Reserved', 2, user);
    await addRecord('LotStatuses', 'Taken', 3, user);
    await addLotOccupantType({
        lotOccupantType: 'Deceased',
        fontAwesomeIconClass: 'cross',
        orderNumber: 1
    }, user);
    await addLotOccupantType({
        lotOccupantType: 'Funeral Director',
        fontAwesomeIconClass: 'church',
        orderNumber: 2
    }, user);
    await addLotOccupantType({
        lotOccupantType: 'Preneed Owner',
        fontAwesomeIconClass: 'user',
        orderNumber: 3
    }, user);
    await addLotOccupantType({
        lotOccupantType: 'Purchaser',
        fontAwesomeIconClass: 'hand-holding-usd',
        occupantCommentTitle: 'Relationship to Owner/Deceased',
        orderNumber: 4
    }, user);
    await addRecord('OccupancyTypes', 'Preneed', 1, user);
    const intermentOccupancyTypeId = await addRecord('OccupancyTypes', 'Interment', 2, user);
    const cremationOccupancyTypeId = await addRecord('OccupancyTypes', 'Cremation', 3, user);
    const deathDateField = {
        occupancyTypeId: intermentOccupancyTypeId,
        occupancyTypeField: 'Death Date',
        occupancyTypeFieldValues: '',
        pattern: '\\d{4}([\\/-]\\d{2}){2}',
        isRequired: '',
        minimumLength: 10,
        maximumLength: 10,
        orderNumber: 1
    };
    await addOccupancyTypeField(deathDateField, user);
    await addOccupancyTypeField(Object.assign(deathDateField, {
        occupancyTypeId: cremationOccupancyTypeId
    }), user);
    const deathAgeField = {
        occupancyTypeId: intermentOccupancyTypeId,
        occupancyTypeField: 'Death Age',
        occupancyTypeFieldValues: '',
        pattern: '\\d+',
        isRequired: '',
        minimumLength: 1,
        maximumLength: 3,
        orderNumber: 2
    };
    await addOccupancyTypeField(deathAgeField, user);
    await addOccupancyTypeField(Object.assign(deathAgeField, { occupancyTypeId: cremationOccupancyTypeId }), user);
    const deathAgePeriod = {
        occupancyTypeId: intermentOccupancyTypeId,
        occupancyTypeField: 'Death Age Period',
        occupancyTypeFieldValues: 'Years\nMonths\nDays\nStillborn',
        pattern: '',
        isRequired: '',
        minimumLength: 1,
        maximumLength: 10,
        orderNumber: 3
    };
    await addOccupancyTypeField(deathAgePeriod, user);
    await addOccupancyTypeField(Object.assign(deathAgePeriod, {
        occupancyTypeId: cremationOccupancyTypeId
    }), user);
    const deathPlace = {
        occupancyTypeId: intermentOccupancyTypeId,
        occupancyTypeField: 'Death Place',
        occupancyTypeFieldValues: '',
        pattern: '',
        isRequired: '',
        minimumLength: 1,
        maximumLength: 100,
        orderNumber: 4
    };
    await addOccupancyTypeField(deathPlace, user);
    await addOccupancyTypeField(Object.assign(deathPlace, { occupancyTypeId: cremationOccupancyTypeId }), user);
    const funeralHome = {
        occupancyTypeId: intermentOccupancyTypeId,
        occupancyTypeField: 'Funeral Home',
        occupancyTypeFieldValues: '',
        pattern: '',
        isRequired: '',
        minimumLength: 1,
        maximumLength: 100,
        orderNumber: 10
    };
    await addOccupancyTypeField(funeralHome, user);
    await addOccupancyTypeField(Object.assign(funeralHome, { occupancyTypeId: cremationOccupancyTypeId }), user);
    const funeralDate = {
        occupancyTypeId: intermentOccupancyTypeId,
        occupancyTypeField: 'Funeral Date',
        occupancyTypeFieldValues: '',
        pattern: '\\d{4}([\\/-]\\d{2}){2}',
        isRequired: '',
        minimumLength: 10,
        maximumLength: 10,
        orderNumber: 11
    };
    await addOccupancyTypeField(funeralDate, user);
    await addOccupancyTypeField(Object.assign(funeralDate, { occupancyTypeId: cremationOccupancyTypeId }), user);
    const containerType = {
        occupancyTypeId: intermentOccupancyTypeId,
        occupancyTypeField: 'Container Type',
        occupancyTypeFieldValues: '',
        pattern: '',
        isRequired: '',
        minimumLength: 1,
        maximumLength: 100,
        orderNumber: 20
    };
    await addOccupancyTypeField(containerType, user);
    await addOccupancyTypeField(Object.assign(containerType, { occupancyTypeId: cremationOccupancyTypeId }), user);
    const committalType = {
        occupancyTypeId: intermentOccupancyTypeId,
        occupancyTypeField: 'Committal Type',
        occupancyTypeFieldValues: '',
        pattern: '',
        isRequired: '',
        minimumLength: 1,
        maximumLength: 100,
        orderNumber: 21
    };
    await addOccupancyTypeField(committalType, user);
    await addOccupancyTypeField(Object.assign(committalType, { occupancyTypeId: cremationOccupancyTypeId }), user);
    await addRecord('FeeCategories', 'Interment Rights', 1, user);
    await addRecord('FeeCategories', 'Cremation Services', 2, user);
    await addRecord('FeeCategories', 'Burial Charges', 3, user);
    await addRecord('FeeCategories', 'Disinterment of Human Remains', 4, user);
    await addRecord('FeeCategories', 'Additional Services', 5, user);
    await addRecord('WorkOrderTypes', 'Cemetery Work Order', 1, user);
    await addRecord('WorkOrderMilestoneTypes', 'Funeral', 1, user);
    await addRecord('WorkOrderMilestoneTypes', 'Arrival', 2, user);
    await addRecord('WorkOrderMilestoneTypes', 'Cremation', 3, user);
    await addRecord('WorkOrderMilestoneTypes', 'Interment', 4, user);
    return true;
}
