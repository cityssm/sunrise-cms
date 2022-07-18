import fs from "node:fs";
import papa from "papaparse";
import sqlite from "better-sqlite3";
import { lotOccupancyDB as databasePath } from "../data/databasePaths.js";
import { addMap } from "../helpers/lotOccupancyDB/addMap.js";
import { getMap as getMapFromDatabase } from "../helpers/lotOccupancyDB/getMap.js";
import { getLotTypes } from "../helpers/lotOccupancyDB/getLotTypes.js";
import { addLot } from "../helpers/lotOccupancyDB/addLot.js";
const user = {
    user: {
        userName: "import.unix",
        userProperties: {
            canUpdate: true,
            isAdmin: false
        }
    }
};
const configTablesInString = "'Maps', 'LotTypes'";
function purgeTables() {
    const database = sqlite(databasePath);
    database.prepare("delete from Lots").run();
    database.prepare("delete from sqlite_sequence where name not in (" + configTablesInString + ")").run();
    database.close();
}
function purgeConfigTables() {
    const database = sqlite(databasePath);
    database.prepare("delete from Maps").run();
    database.prepare("delete from sqlite_sequence where name in ('Maps')").run();
    database.close();
}
function getMapByMapDescription(mapDescription) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const map = database
        .prepare("select * from Maps" +
        " where mapDescription = ?")
        .get(mapDescription);
    database.close();
    return map;
}
const mapCache = new Map();
function getMap(masterRow) {
    if (mapCache.has(masterRow.CM_CEMETERY)) {
        return mapCache.get(masterRow.CM_CEMETERY);
    }
    let map = getMapByMapDescription(masterRow.CM_CEMETERY);
    if (!map) {
        console.log("Creating map: " + masterRow.CM_CEMETERY);
        const mapId = addMap({
            mapName: masterRow.CM_CEMETERY,
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
    mapCache.set(masterRow.CM_CEMETERY, map);
    return map;
}
function importFromCSV() {
    const lotTypes = getLotTypes();
    const rawData = fs.readFileSync("./temp/CMMASTER.csv").toString();
    const cmmaster = papa.parse(rawData, {
        delimiter: ",",
        header: true,
        skipEmptyLines: true
    });
    for (const parseError of cmmaster.errors) {
        console.log(parseError);
    }
    for (const masterRow of cmmaster.data) {
        const map = getMap(masterRow);
        const lotName = masterRow.CM_CEMETERY + "-" +
            (masterRow.CM_BLOCK === "" ? "" : masterRow.CM_BLOCK + "-") +
            (masterRow.CM_RANGE2 === "" ? masterRow.CM_RANGE1.toString() : masterRow.CM_RANGE2) + "-" +
            (masterRow.CM_LOT2 === "" ? masterRow.CM_LOT1.toString() : masterRow.CM_LOT2) + "-" +
            (masterRow.CM_GRAVE2 === "" ? masterRow.CM_GRAVE1.toString() : masterRow.CM_GRAVE2) + "-" +
            masterRow.CM_INTERMENT;
        const lotId = addLot({
            lotName: lotName,
            lotTypeId: lotTypes[0].lotTypeId,
            lotTypeStatusId: "",
            mapId: map.mapId,
            mapKey: lotName,
            lotLatitude: "",
            lotLongitude: ""
        }, user);
    }
}
purgeTables();
importFromCSV();
