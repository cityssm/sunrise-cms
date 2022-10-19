"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const urlPrefix = document.querySelector("main").dataset.urlPrefix;
    const mapId = document.querySelector("#map--mapId")
        .value;
    const isCreate = mapId === "";
    const mapForm = document.querySelector("#form--map");
    const updateMap = (formEvent) => {
        formEvent.preventDefault();
        cityssm.postJSON(urlPrefix + "/maps/" + (isCreate ? "doCreateMap" : "doUpdateMap"), mapForm, (responseJSON) => {
            if (responseJSON.success) {
                cityssm.disableNavBlocker();
                if (isCreate) {
                    window.location.href =
                        urlPrefix + "/maps/" + responseJSON.mapId + "/edit";
                }
                else {
                    bulmaJS.alert({
                        message: exports.aliases.map + " Updated Successfully",
                        contextualColorName: "success"
                    });
                }
            }
            else {
                bulmaJS.alert({
                    title: "Error Updating " + exports.aliases.map,
                    message: responseJSON.errorMessage,
                    contextualColorName: "danger"
                });
            }
        });
    };
    mapForm.addEventListener("submit", updateMap);
    const inputElements = mapForm.querySelectorAll("input, select");
    for (const inputElement of inputElements) {
        inputElement.addEventListener("change", cityssm.enableNavBlocker);
    }
    if (!isCreate) {
        document
            .querySelector("#button--deleteMap")
            .addEventListener("click", (clickEvent) => {
            clickEvent.preventDefault();
            const doDelete = () => {
                cityssm.postJSON(urlPrefix + "/maps/doDeleteMap", {
                    mapId
                }, (responseJSON) => {
                    if (responseJSON.success) {
                        window.location.href =
                            urlPrefix + "/maps?t=" + Date.now();
                    }
                    else {
                        bulmaJS.alert({
                            title: "Error Deleting " + exports.aliases.map,
                            message: responseJSON.errorMessage,
                            contextualColorName: "danger"
                        });
                    }
                });
            };
            bulmaJS.confirm({
                title: "Delete " + exports.aliases.map,
                message: "Are you sure you want to delete this " +
                    exports.aliases.map.toLowerCase() +
                    " and all related " + exports.aliases.lots.toLowerCase() +
                    "?",
                contextualColorName: "warning",
                okButton: {
                    text: "Yes, Delete " + exports.aliases.map + "?",
                    callbackFunction: doDelete
                }
            });
        });
    }
})();
