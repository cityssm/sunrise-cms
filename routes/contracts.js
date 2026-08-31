import { Router } from 'express';
import multer from 'multer';
import handler_doGetRecordAuditLog from '../handlers/commonPost/doGetRecordAuditLog.js';
import handler_attachment from '../handlers/contractsGet/attachment.js';
import handler_edit from '../handlers/contractsGet/edit.js';
import handler_new from '../handlers/contractsGet/new.js';
import handler_next from '../handlers/contractsGet/next.js';
import handler_previous from '../handlers/contractsGet/previous.js';
import handler_search from '../handlers/contractsGet/search.js';
import handler_view from '../handlers/contractsGet/view.js';
import handler_doAddContractComment from '../handlers/contractsPost/doAddContractComment.js';
import handler_doAddContractFee from '../handlers/contractsPost/doAddContractFee.js';
import handler_doAddContractFeeCategory from '../handlers/contractsPost/doAddContractFeeCategory.js';
import handler_doAddContractInterment from '../handlers/contractsPost/doAddContractInterment.js';
import handler_doAddContractServiceType from '../handlers/contractsPost/doAddContractServiceType.js';
import handler_doAddContractTransaction from '../handlers/contractsPost/doAddContractTransaction.js';
import handler_doAddRelatedContract from '../handlers/contractsPost/doAddRelatedContract.js';
import handler_doCopyContract from '../handlers/contractsPost/doCopyContract.js';
import handler_doCreateContract from '../handlers/contractsPost/doCreateContract.js';
import handler_doDeleteContract from '../handlers/contractsPost/doDeleteContract.js';
import handler_doDeleteContractAttachment from '../handlers/contractsPost/doDeleteContractAttachment.js';
import handler_doDeleteContractComment from '../handlers/contractsPost/doDeleteContractComment.js';
import handler_doDeleteContractFee from '../handlers/contractsPost/doDeleteContractFee.js';
import handler_doDeleteContractInterment from '../handlers/contractsPost/doDeleteContractInterment.js';
import handler_doDeleteContractServiceType from '../handlers/contractsPost/doDeleteContractServiceType.js';
import handler_doDeleteContractTransaction from '../handlers/contractsPost/doDeleteContractTransaction.js';
import handler_doDeleteRelatedContract from '../handlers/contractsPost/doDeleteRelatedContract.js';
import handler_doGetBurialSiteDirectionsOfArrival from '../handlers/contractsPost/doGetBurialSiteDirectionsOfArrival.js';
import handler_doGetContractDetailsForConsignoCloud from '../handlers/contractsPost/doGetContractDetailsForConsignoCloud.js';
import handler_doGetContractTypeFields from '../handlers/contractsPost/doGetContractTypeFields.js';
import handler_doGetDynamicsGPDocument from '../handlers/contractsPost/doGetDynamicsGPDocument.js';
import handler_doGetFees from '../handlers/contractsPost/doGetFees.js';
import handler_doGetFuneralDirectors from '../handlers/contractsPost/doGetFuneralDirectors.js';
import handler_doGetPossibleRelatedContracts from '../handlers/contractsPost/doGetPossibleRelatedContracts.js';
import handler_doSearchContracts from '../handlers/contractsPost/doSearchContracts.js';
import handler_doStartConsignoCloudWorkflow from '../handlers/contractsPost/doStartConsignoCloudWorkflow.js';
import handler_doUpdateContract from '../handlers/contractsPost/doUpdateContract.js';
import handler_doUpdateContractAttachment from '../handlers/contractsPost/doUpdateContractAttachment.js';
import handler_doUpdateContractComment from '../handlers/contractsPost/doUpdateContractComment.js';
import handler_doUpdateContractFeeQuantity from '../handlers/contractsPost/doUpdateContractFeeQuantity.js';
import handler_doUpdateContractInterment from '../handlers/contractsPost/doUpdateContractInterment.js';
import handler_doUpdateContractServiceType from '../handlers/contractsPost/doUpdateContractServiceType.js';
import handler_doUpdateContractTransaction from '../handlers/contractsPost/doUpdateContractTransaction.js';
import handler_doUploadContractAttachment from '../handlers/contractsPost/doUploadContractAttachment.js';
import { updateContractsGetHandler, updateContractsPostHandler } from '../handlers/permissions.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
export default function getContractsRouter() {
    const router = Router();
    router
        .get('/', handler_search)
        .post('/doSearchContracts', handler_doSearchContracts);
    router
        .get('/new', updateContractsGetHandler, handler_new)
        .post('/doGetContractTypeFields', updateContractsPostHandler, handler_doGetContractTypeFields)
        .post('/doCreateContract', updateContractsPostHandler, handler_doCreateContract);
    router
        .get('/:contractId', handler_view)
        .get('/:contractId/next', handler_next)
        .get('/:contractId/previous', handler_previous);
    router
        .get('/:contractId/edit', updateContractsGetHandler, handler_edit)
        .post('/doUpdateContract', updateContractsPostHandler, handler_doUpdateContract)
        .post('/doCopyContract', updateContractsPostHandler, handler_doCopyContract)
        .post('/doDeleteContract', updateContractsPostHandler, handler_doDeleteContract)
        .post('/doGetBurialSiteDirectionsOfArrival', updateContractsPostHandler, handler_doGetBurialSiteDirectionsOfArrival)
        .post('/doGetFuneralDirectors', updateContractsPostHandler, handler_doGetFuneralDirectors);
    router
        .post('/doAddContractInterment', updateContractsPostHandler, handler_doAddContractInterment)
        .post('/doUpdateContractInterment', updateContractsPostHandler, handler_doUpdateContractInterment)
        .post('/doDeleteContractInterment', updateContractsPostHandler, handler_doDeleteContractInterment);
    router
        .post('/doAddContractServiceType', updateContractsPostHandler, handler_doAddContractServiceType)
        .post('/doUpdateContractServiceType', updateContractsPostHandler, handler_doUpdateContractServiceType)
        .post('/doDeleteContractServiceType', updateContractsPostHandler, handler_doDeleteContractServiceType);
    router
        .post('/doAddContractComment', updateContractsPostHandler, handler_doAddContractComment)
        .post('/doUpdateContractComment', updateContractsPostHandler, handler_doUpdateContractComment)
        .post('/doDeleteContractComment', updateContractsPostHandler, handler_doDeleteContractComment);
    router
        .post('/doGetFees', updateContractsPostHandler, handler_doGetFees)
        .post('/doAddContractFee', updateContractsPostHandler, handler_doAddContractFee)
        .post('/doAddContractFeeCategory', updateContractsPostHandler, handler_doAddContractFeeCategory)
        .post('/doUpdateContractFeeQuantity', updateContractsPostHandler, handler_doUpdateContractFeeQuantity)
        .post('/doDeleteContractFee', updateContractsPostHandler, handler_doDeleteContractFee);
    if (getConfigProperty('integrations.dynamicsGP.integrationIsEnabled')) {
        router.post('/doGetDynamicsGPDocument', updateContractsPostHandler, handler_doGetDynamicsGPDocument);
    }
    router
        .post('/doAddContractTransaction', updateContractsPostHandler, handler_doAddContractTransaction)
        .post('/doUpdateContractTransaction', updateContractsPostHandler, handler_doUpdateContractTransaction)
        .post('/doDeleteContractTransaction', updateContractsPostHandler, handler_doDeleteContractTransaction);
    if (getConfigProperty('integrations.consignoCloud.integrationIsEnabled')) {
        router
            .post('/doGetContractDetailsForConsignoCloud', updateContractsPostHandler, handler_doGetContractDetailsForConsignoCloud)
            .post('/doStartConsignoCloudWorkflow', updateContractsPostHandler, handler_doStartConsignoCloudWorkflow);
    }
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: getConfigProperty('application.maxAttachmentFileSize') * 1024 * 1024
        }
    });
    router
        .get('/attachment/:attachmentId', handler_attachment)
        .post('/doUploadContractAttachment', updateContractsPostHandler, upload.single('file'), handler_doUploadContractAttachment)
        .post('/doUpdateContractAttachment', updateContractsPostHandler, handler_doUpdateContractAttachment)
        .post('/doDeleteContractAttachment', updateContractsPostHandler, handler_doDeleteContractAttachment);
    router
        .post('/doGetPossibleRelatedContracts', updateContractsPostHandler, handler_doGetPossibleRelatedContracts)
        .post('/doAddRelatedContract', updateContractsPostHandler, handler_doAddRelatedContract)
        .post('/doDeleteRelatedContract', updateContractsPostHandler, handler_doDeleteRelatedContract);
    if (getConfigProperty('settings.auditLog.enabled')) {
        router.post('/doGetRecordAuditLog', updateContractsPostHandler, handler_doGetRecordAuditLog('contract'));
    }
    return router;
}
