import sqlite from 'better-sqlite3';
import Debug from 'debug';
import deleteContractTypePrint from '../../database/deleteContractTypePrint.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getAllCachedContractTypeFields, getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doDeleteContractTypePrint`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = deleteContractTypePrint(request.body.contractTypeId, request.body.printEJS, request.session.user, database);
        const contractTypes = getCachedContractTypes();
        const allContractTypeFields = getAllCachedContractTypeFields();
        response.json({
            success,
            allContractTypeFields,
            contractTypes
        });
    }
    catch (error) {
        debug(error);
        response
            .status(500)
            .json({ errorMessage: 'Database error', success: false });
    }
    finally {
        database?.close();
    }
}
