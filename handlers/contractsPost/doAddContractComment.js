import Debug from 'debug';
import addContractComment from '../../database/addContractComment.js';
import getContractComments from '../../database/getContractComments.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getDatabaseConnection } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:doAddContractComment`);
export default function handler(request, response) {
    let database;
    try {
        database = getDatabaseConnection();
        addContractComment(request.body, request.session.user, database);
        const contractComments = getContractComments(request.body.contractId, database);
        response.json({
            success: true,
            contractComments
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
