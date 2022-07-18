import { Router } from "express";

import * as permissionHandlers from "../handlers/permissions.js";

import handler_search from "../handlers/maps-get/search.js";

import handler_view from "../handlers/maps-get/view.js";
import handler_new from "../handlers/maps-get/new.js";


export const router = Router();


router.get("/",
    handler_search);


router.get("/new",
    permissionHandlers.updateGetHandler,
    handler_new);


router.get("/:mapId",
  handler_view);



export default router;