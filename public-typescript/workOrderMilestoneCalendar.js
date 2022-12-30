"use strict";
/* eslint-disable @typescript-eslint/no-non-null-assertion, unicorn/prefer-module */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const los = exports.los;
    const workOrderSearchFiltersFormElement = document.querySelector("#form--searchFilters");
    const workOrderMilestoneDateFilterElement = workOrderSearchFiltersFormElement.querySelector("#searchFilter--workOrderMilestoneDateFilter");
    const workOrderMilestoneDateStringElement = workOrderSearchFiltersFormElement.querySelector("#searchFilter--workOrderMilestoneDateString");
    const milestoneCalendarContainerElement = document.querySelector("#container--milestoneCalendar");
    function renderMilestones(workOrderMilestones) {
        if (workOrderMilestones.length === 0) {
            milestoneCalendarContainerElement.innerHTML =
                '<div class="message is-info">' +
                    '<p class="message-body">There are no milestones that meet the search criteria.</p>' +
                    "</div>";
            return;
        }
        milestoneCalendarContainerElement.innerHTML = "";
        const currentDate = cityssm.dateToString(new Date());
        let currentPanelElement;
        let currentPanelDateString = "";
        for (const milestone of workOrderMilestones) {
            if (currentPanelDateString !== milestone.workOrderMilestoneDateString) {
                if (currentPanelElement) {
                    milestoneCalendarContainerElement.append(currentPanelElement);
                }
                currentPanelElement = document.createElement("div");
                currentPanelElement.className = "panel";
                currentPanelElement.innerHTML =
                    '<h2 class="panel-heading">' + milestone.workOrderMilestoneDateString + "</h2>";
                currentPanelDateString = milestone.workOrderMilestoneDateString;
            }
            const panelBlockElement = document.createElement("div");
            panelBlockElement.className = "panel-block is-block";
            if (!milestone.workOrderMilestoneCompletionDate &&
                milestone.workOrderMilestoneDateString < currentDate) {
                panelBlockElement.classList.add("has-background-warning-light");
            }
            let lotOccupancyHTML = "";
            for (const lot of milestone.workOrderLots) {
                lotOccupancyHTML +=
                    '<span class="has-tooltip-left" data-tooltip="' +
                        cityssm.escapeHTML(lot.mapName || "") +
                        '">' +
                        '<i class="fas fa-vector-square" aria-label="' +
                        los.escapedAliases.Lot +
                        '"></i> ' +
                        cityssm.escapeHTML(lot.lotName || "") +
                        "</span>" +
                        "<br />";
            }
            for (const lotOccupancy of milestone.workOrderLotOccupancies) {
                for (const occupant of lotOccupancy.lotOccupancyOccupants) {
                    lotOccupancyHTML +=
                        '<span class="has-tooltip-left" data-tooltip="' +
                            cityssm.escapeHTML(occupant.lotOccupantType || "") +
                            '">' +
                            '<i class="fas fa-user" aria-label="' +
                            los.escapedAliases.Occupancy +
                            '"></i> ' +
                            cityssm.escapeHTML(occupant.occupantName || "") +
                            "</span>" +
                            "<br />";
                }
            }
            panelBlockElement.innerHTML =
                '<div class="columns">' +
                    ('<div class="column is-narrow">' +
                        '<span class="icon is-small">' +
                        (milestone.workOrderMilestoneCompletionDate
                            ? '<i class="fas fa-check" aria-label="Completed"></i>'
                            : '<i class="far fa-square has-text-grey" aria-label="Incomplete"></i>') +
                        "</span>" +
                        "</div>") +
                    ('<div class="column">' +
                        (milestone.workOrderMilestoneTime === 0
                            ? ""
                            : milestone.workOrderMilestoneTimeString + "<br />") +
                        (milestone.workOrderMilestoneTypeId
                            ? "<strong>" +
                                cityssm.escapeHTML(milestone.workOrderMilestoneType) +
                                "</strong><br />"
                            : "") +
                        '<span class="is-size-7">' +
                        cityssm.escapeHTML(milestone.workOrderMilestoneDescription) +
                        "</span>" +
                        "</div>") +
                    ('<div class="column">' +
                        '<i class="fas fa-circle" style="color:' +
                        los.getRandomColor(milestone.workOrderNumber || "") +
                        '" aria-hidden="true"></i>' +
                        ' <a class="has-text-weight-bold" href="' +
                        los.urlPrefix +
                        "/workOrders/" +
                        milestone.workOrderId +
                        '">' +
                        cityssm.escapeHTML(milestone.workOrderNumber || "") +
                        "</a><br />" +
                        '<span class="is-size-7">' +
                        cityssm.escapeHTML(milestone.workOrderDescription || "") +
                        "</span>" +
                        "</div>") +
                    ('<div class="column is-size-7">' + lotOccupancyHTML + "</div>") +
                    "</div>";
            currentPanelElement.append(panelBlockElement);
        }
        milestoneCalendarContainerElement.append(currentPanelElement);
    }
    function getMilestones(event) {
        if (event) {
            event.preventDefault();
        }
        milestoneCalendarContainerElement.innerHTML =
            los.getLoadingParagraphHTML("Loading Milestones...");
        cityssm.postJSON(los.urlPrefix + "/workOrders/doGetWorkOrderMilestones", workOrderSearchFiltersFormElement, (responseJSON) => {
            renderMilestones(responseJSON.workOrderMilestones);
        });
    }
    workOrderMilestoneDateFilterElement.addEventListener("change", () => {
        workOrderMilestoneDateStringElement.closest("fieldset").disabled =
            workOrderMilestoneDateFilterElement.value !== "date";
        getMilestones();
    });
    los.initializeDatePickers(workOrderSearchFiltersFormElement);
    workOrderMilestoneDateStringElement.addEventListener("change", getMilestones);
    workOrderSearchFiltersFormElement.addEventListener("submit", getMilestones);
    getMilestones();
})();
