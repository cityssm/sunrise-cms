import {
    Router
} from "express";

import handler_search from "../handlers/lotOccupancies-get/search.js";
import handler_doSearchLotOccupancies from "../handlers/lotOccupancies-post/doSearchLotOccupancies.js";

import handler_view from "../handlers/lotOccupancies-get/view.js";

import handler_edit from "../handlers/lotOccupancies-get/edit.js";
import handler_doUpdateLotOccupancy from "../handlers/lotOccupancies-post/doUpdateLotOccupancy.js";

import handler_doAddLotOccupancyOccupant from "../handlers/lotOccupancies-post/doAddLotOccupancyOccupant.js";
import handler_doUpdateLotOccupancyOccupant from "../handlers/lotOccupancies-post/doUpdateLotOccupancyOccupant.js";
import handler_doDeleteLotOccupancyOccupant from "../handlers/lotOccupancies-post/doDeleteLotOccupancyOccupant.js";

import * as permissionHandlers from "../handlers/permissions.js";


export const router = Router();


router.get("/",
    handler_search);


router.post("/doSearchLotOccupancies",
    handler_doSearchLotOccupancies);


router.get("/:lotOccupancyId",
    handler_view);


router.get("/:lotOccupancyId/edit",
    permissionHandlers.updateGetHandler,
    handler_edit);

router.post("/doUpdateLotOccupancy",
    permissionHandlers.updatePostHandler,
    handler_doUpdateLotOccupancy);

router.post("/doAddLotOccupancyOccupant",
    permissionHandlers.updatePostHandler,
    handler_doAddLotOccupancyOccupant);

router.post("/doUpdateLotOccupancyOccupant",
    permissionHandlers.updatePostHandler,
    handler_doUpdateLotOccupancyOccupant);

router.post("/doDeleteLotOccupancyOccupant",
    permissionHandlers.updatePostHandler,
    handler_doDeleteLotOccupancyOccupant);


export default router;