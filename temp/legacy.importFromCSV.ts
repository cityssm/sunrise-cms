/* eslint-disable node/no-extraneous-import, node/no-unpublished-import */

import fs from "node:fs";
import papa from "papaparse";

import sqlite from "better-sqlite3";
import {
    lotOccupancyDB as databasePath
} from "../data/databasePaths.js";

import * as cacheFunctions from "../helpers/functions.cache.js";

import {
    addMap
} from "../helpers/lotOccupancyDB/addMap.js";
import {
    getMap as getMapFromDatabase
} from "../helpers/lotOccupancyDB/getMap.js";

import {
    addLot
} from "../helpers/lotOccupancyDB/addLot.js";
import {
    updateLotStatus
} from "../helpers/lotOccupancyDB/updateLot.js";

import {
    addLotOccupancy
} from "../helpers/lotOccupancyDB/addLotOccupancy.js";

import {
    addLotOccupancyOccupant
} from "../helpers/lotOccupancyDB/addLotOccupancyOccupant.js";

import {
    addLotOccupancyComment
} from "../helpers/lotOccupancyDB/addLotOccupancyComment.js";

import {
    addOrUpdateLotOccupancyField
} from "../helpers/lotOccupancyDB/addOrUpdateLotOccupancyField.js";

import type * as recordTypes from "../types/recordTypes";


interface MasterRecord {
    CM_SYSREC: string;
    CM_CEMETERY: string;
    CM_BLOCK: string;
    CM_RANGE1: string;
    CM_RANGE2: string;
    CM_LOT1: string;
    CM_LOT2: string;
    CM_GRAVE1: number;
    CM_GRAVE2: string;
    CM_INTERMENT: string;
    CM_PRENEED_OWNER: string;
    CM_PRENEED_OWNER_SEQ: string;
    CM_DECEASED_NAME: string;
    CM_DECEASED_NAME_SEQ: string;
    CM_ADDRESS: string;
    CM_CITY: string;
    CM_PROV: string;
    CM_POST1: string;
    CM_POST2: string;
    CM_PRENEED_ORDER: string;
    CM_PURCHASE_YR: string;
    CM_PURCHASE_MON: string;
    CM_PURCHASE_DAY: string;
    CM_NO_GRAVES: string;
    CM_DEATH_YR: string;
    CM_DEATH_MON: string;
    CM_DEATH_DAY: string;
    CM_WORK_ORDER: string;
    CM_INTERMENT_YR: string;
    CM_INTERMENT_MON: string;
    CM_INTERMENT_DAY: string;
    CM_AGE: string;
    CM_CONTAINER_TYPE: string;
    CM_COMMITTAL_TYPE: string;
    CM_CREMATION: string;
    CM_FUNERAL_HOME: string;
    CM_FUNERAL_YR: string;
    CM_FUNERAL_MON: string;
    CM_FUNERAL_DAY: string;
    CM_RESIDENT_TYPE: string;
    CM_REMARK1: string;
    CM_REMARK2: string;
    CM_STATUS: string;
    CM_PERIOD: string;
    CM_LAST_CHG_DATE: string;
    CM_DEPTH: string;
}


const user: recordTypes.PartialSession = {
    user: {
        userName: "import.unix",
        userProperties: {
            canUpdate: true,
            isAdmin: false
        }
    }
};


function purgeTables() {
    const database = sqlite(databasePath);
    database.prepare("delete from LotOccupancyFields").run();
    database.prepare("delete from LotOccupancyComments").run();
    database.prepare("delete from LotOccupancyOccupants").run();
    database.prepare("delete from LotOccupancies").run();
    database.prepare("delete from Lots").run();
    database.prepare("delete from sqlite_sequence where name in ('Lots', 'LotOccupancies', 'LotOccupancyComments')").run();
    database.close();
}


function purgeConfigTables() {
    const database = sqlite(databasePath);
    database.prepare("delete from Maps").run();
    database.prepare("delete from sqlite_sequence where name in ('Maps')").run();
    database.close();
}


function getMapByMapDescription(mapDescription: string) {

    const database = sqlite(databasePath, {
        readonly: true
    });

    const map: recordTypes.Map = database
        .prepare("select * from Maps" +
            " where mapDescription = ?")
        .get(mapDescription);

    database.close();

    return map;
}

function formatDateString(year: string, month: string, day: string) {

    return ("0000" + year).slice(-4) + "-" +
        ("00" + month).slice(-2) + "-" +
        ("00" + day).slice(-2);
}


const cemeteryToMapName = {
    "00": "Crematorium",
    "GC": "New Greenwood - Columbarium",
    "HC": "Holy Sepulchre - Columbarium",
    "HS": "Holy Sepulchre",
    "MA": "Holy Sepulchre - Mausoleum",
    "NG": "New Greenwood",
    "NW": "Niche Wall",
    "OG": "Old Greenwood",
    "PG": "Pine Grove",
    "UG": "New Greenwood - Urn Garden",
    "WK": "West Korah"
}

const mapCache: Map < string, recordTypes.Map > = new Map();


function getMap(masterRow: MasterRecord): recordTypes.Map {

    const mapCacheKey = masterRow.CM_CEMETERY;

    /*
    if (masterRow.CM_CEMETERY === "HS" &&
        (masterRow.CM_BLOCK === "F" || masterRow.CM_BLOCK === "G" || masterRow.CM_BLOCK === "H" || masterRow.CM_BLOCK === "J")) {
        mapCacheKey += "-" + masterRow.CM_BLOCK;
    }
    */

    if (mapCache.has(mapCacheKey)) {
        return mapCache.get(mapCacheKey);
    }

    let map = getMapByMapDescription(mapCacheKey);

    if (!map) {

        console.log("Creating map: " + masterRow.CM_CEMETERY);

        const mapId = addMap({
            mapName: cemeteryToMapName[masterRow.CM_CEMETERY] || masterRow.CM_CEMETERY,
            mapDescription: masterRow.CM_CEMETERY,
            mapSVG: "",
            mapLatitude: "",
            mapLongitude: "",
            mapAddress1: "",
            mapAddress2: "",
            mapCity: "Sault Ste. Marie",
            mapProvince: "ON",
            mapPostalCode: "",
            mapPhoneNumber: ""
        }, user);

        map = getMapFromDatabase(mapId);
    }

    mapCache.set(mapCacheKey, map);

    return map;
}


function importFromCSV() {

    let masterRow: MasterRecord;

    // Load cached values
    const casketLotType = cacheFunctions.getLotTypesByLotType("Casket Grave");
    const columbariumLotType = cacheFunctions.getLotTypesByLotType("Columbarium");
    const crematoriumLotType = cacheFunctions.getLotTypesByLotType("Crematorium");
    const mausoleumLotType = cacheFunctions.getLotTypesByLotType("Mausoleum");
    const nicheWallLotType = cacheFunctions.getLotTypesByLotType("Niche Wall");
    const urnGardenLotType = cacheFunctions.getLotTypesByLotType("Urn Garden");

    const availableLotStatus = cacheFunctions.getLotStatusByLotStatus("Available");

    const preneedOccupancyType = cacheFunctions.getOccupancyTypeByOccupancyType("Preneed");
    const preneedOwnerLotOccupantType = cacheFunctions.getLotOccupantTypesByLotOccupantType("Preneed Owner");
    const reservedLotStatus = cacheFunctions.getLotStatusByLotStatus("Reserved");

    const deceasedOccupancyType = cacheFunctions.getOccupancyTypeByOccupancyType("Interment");
    const deceasedLotOccupantType = cacheFunctions.getLotOccupantTypesByLotOccupantType("Deceased");
    const takenLotStatus = cacheFunctions.getLotStatusByLotStatus("Taken");

    const rawData = fs.readFileSync("./temp/CMMASTER.csv").toString();

    const cmmaster: papa.ParseResult < MasterRecord > = papa.parse(rawData, {
        delimiter: ",",
        header: true,
        skipEmptyLines: true
    });

    for (const parseError of cmmaster.errors) {
        console.log(parseError);
    }

    try {
        for (masterRow of cmmaster.data) {

            const map = getMap(masterRow);

            const lotName = masterRow.CM_CEMETERY + "-" +
                (masterRow.CM_BLOCK === "" ? "" : masterRow.CM_BLOCK + "-") +
                (masterRow.CM_RANGE1 === "0" && masterRow.CM_RANGE2 === "" ?
                    "" :
                    (masterRow.CM_RANGE1 + masterRow.CM_RANGE2) + "-") +
                (masterRow.CM_LOT1 === "0" && masterRow.CM_LOT2 === "" ?
                    "" :
                    masterRow.CM_LOT1 + masterRow.CM_LOT2 + "-") +
                masterRow.CM_GRAVE1 + masterRow.CM_GRAVE2 + "-" +
                masterRow.CM_INTERMENT;

            let lotType = casketLotType;

            switch (masterRow.CM_CEMETERY) {
                case "00": {
                    lotType = crematoriumLotType;
                    break;
                }
                case "GC":
                case "HC": {
                    lotType = columbariumLotType;
                    break;
                }
                case "MA": {
                    lotType = mausoleumLotType;
                    break;
                }
                case "NW": {
                    lotType = nicheWallLotType;
                    break;
                }
                case "UG": {
                    lotType = urnGardenLotType;
                    break;
                }
            }

            const lotId = addLot({
                lotName: lotName,
                lotTypeId: lotType.lotTypeId,
                lotStatusId: availableLotStatus.lotStatusId,
                mapId: map.mapId,
                mapKey: lotName,
                lotLatitude: "",
                lotLongitude: ""
            }, user);

            if (masterRow.CM_PRENEED_ORDER) {

                let occupancyStartDateString = formatDateString(masterRow.CM_PURCHASE_YR,
                    masterRow.CM_PURCHASE_MON,
                    masterRow.CM_PURCHASE_DAY);

                let occupancyEndDateString = "";

                if (masterRow.CM_INTERMENT_YR !== "" && masterRow.CM_INTERMENT_YR !== "0") {
                    occupancyEndDateString = formatDateString(masterRow.CM_INTERMENT_YR,
                        masterRow.CM_INTERMENT_MON,
                        masterRow.CM_INTERMENT_DAY);
                }

                // if purchase date unavailable
                if (occupancyStartDateString === "0000-00-00" && occupancyEndDateString !== "") {
                    occupancyStartDateString = occupancyEndDateString;
                }

                // if end date unavailable
                if (occupancyStartDateString === "0000-00-00" && masterRow.CM_DEATH_YR !== "" && masterRow.CM_DEATH_YR !== "0") {
                    occupancyStartDateString = formatDateString(masterRow.CM_DEATH_YR,
                        masterRow.CM_DEATH_MON,
                        masterRow.CM_DEATH_DAY);
                }

                if (occupancyStartDateString === "" || occupancyStartDateString === "0000-00-00") {
                    occupancyStartDateString = "0001-01-01";
                }

                const lotOccupancyId = addLotOccupancy({
                    occupancyTypeId: preneedOccupancyType.occupancyTypeId,
                    lotId,
                    occupancyStartDateString,
                    occupancyEndDateString,
                    occupancyTypeFieldIds: ""
                }, user);

                const occupantPostalCode = ((masterRow.CM_POST1 || "") + " " + (masterRow.CM_POST2 || "")).trim();

                addLotOccupancyOccupant({
                    lotOccupancyId,
                    lotOccupantTypeId: preneedOwnerLotOccupantType.lotOccupantTypeId,
                    occupantName: masterRow.CM_PRENEED_OWNER,
                    occupantAddress1: masterRow.CM_ADDRESS,
                    occupantAddress2: "",
                    occupantCity: masterRow.CM_CITY,
                    occupantProvince: masterRow.CM_PROV,
                    occupantPostalCode,
                    occupantPhoneNumber: ""
                }, user);

                if (masterRow.CM_REMARK1 !== "") {
                    addLotOccupancyComment({
                        lotOccupancyId,
                        lotOccupancyCommentDateString: occupancyStartDateString,
                        lotOccupancyCommentTimeString: "00:00",
                        lotOccupancyComment: masterRow.CM_REMARK1
                    }, user);
                }

                if (masterRow.CM_REMARK2 !== "") {
                    addLotOccupancyComment({
                        lotOccupancyId,
                        lotOccupancyCommentDateString: occupancyStartDateString,
                        lotOccupancyCommentTimeString: "00:00",
                        lotOccupancyComment: masterRow.CM_REMARK2
                    }, user);
                }

                if (occupancyEndDateString === "") {
                    updateLotStatus(lotId, reservedLotStatus.lotStatusId, user);
                }
            }

            if (masterRow.CM_DECEASED_NAME) {

                let occupancyStartDateString = formatDateString(masterRow.CM_INTERMENT_YR,
                    masterRow.CM_INTERMENT_MON,
                    masterRow.CM_INTERMENT_DAY);

                const occupancyEndDateString = "";

                // if interment date unavailable
                if (occupancyStartDateString === "0000-00-00" && masterRow.CM_DEATH_YR !== "" && masterRow.CM_DEATH_YR !== "0") {
                    occupancyStartDateString = formatDateString(masterRow.CM_DEATH_YR,
                        masterRow.CM_DEATH_MON,
                        masterRow.CM_DEATH_DAY);
                }

                if (occupancyStartDateString === "" || occupancyStartDateString === "0000-00-00") {
                    occupancyStartDateString = "0001-01-01";
                }

                const lotOccupancyId = addLotOccupancy({
                    occupancyTypeId: deceasedOccupancyType.occupancyTypeId,
                    lotId,
                    occupancyStartDateString,
                    occupancyEndDateString,
                    occupancyTypeFieldIds: ""
                }, user);

                const deceasedPostalCode = ((masterRow.CM_POST1 || "") + " " + (masterRow.CM_POST2 || "")).trim();

                addLotOccupancyOccupant({
                    lotOccupancyId,
                    lotOccupantTypeId: deceasedLotOccupantType.lotOccupantTypeId,
                    occupantName: masterRow.CM_DECEASED_NAME,
                    occupantAddress1: masterRow.CM_ADDRESS,
                    occupantAddress2: "",
                    occupantCity: masterRow.CM_CITY,
                    occupantProvince: masterRow.CM_PROV,
                    occupantPostalCode: deceasedPostalCode,
                    occupantPhoneNumber: ""
                }, user);

                if (masterRow.CM_DEATH_YR !== "") {

                    const lotOccupancyFieldValue = formatDateString(masterRow.CM_DEATH_YR,
                        masterRow.CM_DEATH_MON,
                        masterRow.CM_DEATH_DAY);

                    addOrUpdateLotOccupancyField({
                        lotOccupancyId,
                        occupancyTypeFieldId: deceasedOccupancyType.occupancyTypeFields.find((occupancyTypeField) => {
                            return occupancyTypeField.occupancyTypeField === "Death Date"
                        }).occupancyTypeFieldId,
                        lotOccupancyFieldValue
                    }, user);
                }

                if (masterRow.CM_AGE !== "") {

                    addOrUpdateLotOccupancyField({
                        lotOccupancyId,
                        occupancyTypeFieldId: deceasedOccupancyType.occupancyTypeFields.find((occupancyTypeField) => {
                            return occupancyTypeField.occupancyTypeField === "Death Age"
                        }).occupancyTypeFieldId,
                        lotOccupancyFieldValue: masterRow.CM_AGE
                    }, user);
                }

                if (masterRow.CM_PERIOD !== "") {

                    addOrUpdateLotOccupancyField({
                        lotOccupancyId,
                        occupancyTypeFieldId: deceasedOccupancyType.occupancyTypeFields.find((occupancyTypeField) => {
                            return occupancyTypeField.occupancyTypeField === "Death Age Period"
                        }).occupancyTypeFieldId,
                        lotOccupancyFieldValue: masterRow.CM_PERIOD
                    }, user);
                }

                if (masterRow.CM_FUNERAL_HOME !== "") {

                    addOrUpdateLotOccupancyField({
                        lotOccupancyId,
                        occupancyTypeFieldId: deceasedOccupancyType.occupancyTypeFields.find((occupancyTypeField) => {
                            return occupancyTypeField.occupancyTypeField === "Funeral Home"
                        }).occupancyTypeFieldId,
                        lotOccupancyFieldValue: masterRow.CM_FUNERAL_HOME
                    }, user);
                }

                if (masterRow.CM_FUNERAL_YR !== "") {

                    const lotOccupancyFieldValue = formatDateString(masterRow.CM_FUNERAL_YR,
                        masterRow.CM_FUNERAL_MON,
                        masterRow.CM_FUNERAL_DAY);

                    addOrUpdateLotOccupancyField({
                        lotOccupancyId,
                        occupancyTypeFieldId: deceasedOccupancyType.occupancyTypeFields.find((occupancyTypeField) => {
                            return occupancyTypeField.occupancyTypeField === "Funeral Date"
                        }).occupancyTypeFieldId,
                        lotOccupancyFieldValue
                    }, user);
                }

                if (masterRow.CM_CONTAINER_TYPE !== "") {

                    addOrUpdateLotOccupancyField({
                        lotOccupancyId,
                        occupancyTypeFieldId: deceasedOccupancyType.occupancyTypeFields.find((occupancyTypeField) => {
                            return occupancyTypeField.occupancyTypeField === "Container Type"
                        }).occupancyTypeFieldId,
                        lotOccupancyFieldValue: masterRow.CM_CONTAINER_TYPE
                    }, user);
                }

                if (masterRow.CM_COMMITTAL_TYPE !== "") {

                    let commitalType = masterRow.CM_COMMITTAL_TYPE;

                    if (commitalType === "GS") {
                        commitalType = "Graveside";
                    }

                    addOrUpdateLotOccupancyField({
                        lotOccupancyId,
                        occupancyTypeFieldId: deceasedOccupancyType.occupancyTypeFields.find((occupancyTypeField) => {
                            return occupancyTypeField.occupancyTypeField === "Committal Type"
                        }).occupancyTypeFieldId,
                        lotOccupancyFieldValue: commitalType
                    }, user);
                }

                if (masterRow.CM_REMARK1 !== "") {
                    addLotOccupancyComment({
                        lotOccupancyId,
                        lotOccupancyCommentDateString: occupancyStartDateString,
                        lotOccupancyCommentTimeString: "00:00",
                        lotOccupancyComment: masterRow.CM_REMARK1
                    }, user);
                }

                if (masterRow.CM_REMARK2 !== "") {
                    addLotOccupancyComment({
                        lotOccupancyId,
                        lotOccupancyCommentDateString: occupancyStartDateString,
                        lotOccupancyCommentTimeString: "00:00",
                        lotOccupancyComment: masterRow.CM_REMARK2
                    }, user);
                }

                updateLotStatus(lotId, takenLotStatus.lotStatusId, user);
            }
        }
    } catch (error) {
        console.error(error)
        console.log(masterRow);
    }
}

purgeTables();
purgeConfigTables();
importFromCSV();