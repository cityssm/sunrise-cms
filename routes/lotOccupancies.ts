import { Router } from "express";

import handler_search from "../handlers/lotOccupancies-get/search.js";
import handler_doSearchLotOccupancies from "../handlers/lotOccupancies-post/doSearchLotOccupancies.js";

import handler_view from "../handlers/lotOccupancies-get/view.js";

import handler_new from "../handlers/lotOccupancies-get/new.js";
import handler_doGetOccupancyTypeFields from "../handlers/lotOccupancies-post/doGetOccupancyTypeFields.js";
import handler_doCreateLotOccupancy from "../handlers/lotOccupancies-post/doCreateLotOccupancy.js";

import handler_edit from "../handlers/lotOccupancies-get/edit.js";
import handler_doUpdateLotOccupancy from "../handlers/lotOccupancies-post/doUpdateLotOccupancy.js";
import handler_doDeleteLotOccupancy from "../handlers/lotOccupancies-post/doDeleteLotOccupancy.js";

import handler_doAddLotOccupancyOccupant from "../handlers/lotOccupancies-post/doAddLotOccupancyOccupant.js";
import handler_doUpdateLotOccupancyOccupant from "../handlers/lotOccupancies-post/doUpdateLotOccupancyOccupant.js";
import handler_doDeleteLotOccupancyOccupant from "../handlers/lotOccupancies-post/doDeleteLotOccupancyOccupant.js";

import handler_doAddLotOccupancyComment from "../handlers/lotOccupancies-post/doAddLotOccupancyComment.js";
import handler_doUpdateLotOccupancyComment from "../handlers/lotOccupancies-post/doUpdateLotOccupancyComment.js";
import handler_doDeleteLotOccupancyComment from "../handlers/lotOccupancies-post/doDeleteLotOccupancyComment.js";

import handler_doGetFees from "../handlers/lotOccupancies-post/doGetFees.js";
import handler_doAddLotOccupancyFee from "../handlers/lotOccupancies-post/doAddLotOccupancyFee.js";
import handler_doDeleteLotOccupancyFee from "../handlers/lotOccupancies-post/doDeleteLotOccupancyFee.js";

import handler_doAddLotOccupancyTransaction from "../handlers/lotOccupancies-post/doAddLotOccupancyTransaction.js";
import handler_doDeleteLotOccupancyTransaction from "../handlers/lotOccupancies-post/doDeleteLotOccupancyTransaction.js";

import * as permissionHandlers from "../handlers/permissions.js";

export const router = Router();

// Search

router.get("/", handler_search);

router.post("/doSearchLotOccupancies", handler_doSearchLotOccupancies);

// Create

router.get("/new", permissionHandlers.updateGetHandler, handler_new);

router.post(
    "/doGetOccupancyTypeFields",
    permissionHandlers.updatePostHandler,
    handler_doGetOccupancyTypeFields
);

router.post(
    "/doCreateLotOccupancy",
    permissionHandlers.updatePostHandler,
    handler_doCreateLotOccupancy
);

// View

router.get("/:lotOccupancyId", handler_view);

// Edit

router.get(
    "/:lotOccupancyId/edit",
    permissionHandlers.updateGetHandler,
    handler_edit
);

router.post(
    "/doUpdateLotOccupancy",
    permissionHandlers.updatePostHandler,
    handler_doUpdateLotOccupancy
);

router.post(
    "/doDeleteLotOccupancy",
    permissionHandlers.updatePostHandler,
    handler_doDeleteLotOccupancy
);

// Occupants

router.post(
    "/doAddLotOccupancyOccupant",
    permissionHandlers.updatePostHandler,
    handler_doAddLotOccupancyOccupant
);

router.post(
    "/doUpdateLotOccupancyOccupant",
    permissionHandlers.updatePostHandler,
    handler_doUpdateLotOccupancyOccupant
);

router.post(
    "/doDeleteLotOccupancyOccupant",
    permissionHandlers.updatePostHandler,
    handler_doDeleteLotOccupancyOccupant
);

// Comments

router.post(
    "/doAddLotOccupancyComment",
    permissionHandlers.updatePostHandler,
    handler_doAddLotOccupancyComment
);

router.post(
    "/doUpdateLotOccupancyComment",
    permissionHandlers.updatePostHandler,
    handler_doUpdateLotOccupancyComment
);

router.post(
    "/doDeleteLotOccupancyComment",
    permissionHandlers.updatePostHandler,
    handler_doDeleteLotOccupancyComment
);

// Fees

router.post(
    "/doGetFees",
    permissionHandlers.updatePostHandler,
    handler_doGetFees
);

router.post(
    "/doAddLotOccupancyFee",
    permissionHandlers.updatePostHandler,
    handler_doAddLotOccupancyFee
);

router.post(
    "/doDeleteLotOccupancyFee",
    permissionHandlers.updatePostHandler,
    handler_doDeleteLotOccupancyFee
);

// Transactions

router.post(
    "/doAddLotOccupancyTransaction",
    permissionHandlers.updatePostHandler,
    handler_doAddLotOccupancyTransaction
);

router.post(
    "/doDeleteLotOccupancyTransaction",
    permissionHandlers.updatePostHandler,
    handler_doDeleteLotOccupancyTransaction
);

export default router;
