import sqlite from 'better-sqlite3';
import Debug from 'debug';
import getContract from '../../database/getContract.js';
import getFeeCategories from '../../database/getFeeCategories.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:doGetFees`);
export default async function handler(request, response) {
    const contractId = request.body.contractId;
    let database;
    try {
        database = sqlite(sunriseDB);
        const contract = (await getContract(contractId, database));
        const feeCategories = getFeeCategories({
            burialSiteTypeId: contract.burialSiteTypeId,
            contractTypeId: contract.contractTypeId
        }, {
            includeFees: true
        }, database);
        response.json({
            feeCategories
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
