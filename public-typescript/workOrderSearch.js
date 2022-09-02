"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const urlPrefix = document.querySelector("main").dataset.urlPrefix;
    const searchFilterFormElement = document.querySelector("#form--searchFilters");
    const searchResultsContainerElement = document.querySelector("#container--searchResults");
    const limit = Number.parseInt(document.querySelector("#searchFilter--limit")
        .value, 10);
    const offsetElement = document.querySelector("#searchFilter--offset");
    const getWorkOrders = () => {
        const offset = Number.parseInt(offsetElement.value, 10);
        searchResultsContainerElement.innerHTML =
            '<div class="has-text-grey has-text-centered">' +
                '<i class="fas fa-5x fa-circle-notch fa-spin" aria-hidden="true"></i><br />' +
                "Loading Work Orders..." +
                "</div>";
        cityssm.postJSON(urlPrefix + "/workOrders/doSearchWorkOrders", searchFilterFormElement, (responseJSON) => {
            if (responseJSON.workOrders.length === 0) {
                searchResultsContainerElement.innerHTML =
                    '<div class="message is-info">' +
                        '<p class="message-body">There are no work orders that meet the search criteria.</p>' +
                        "</div>";
                return;
            }
            const resultsTbodyElement = document.createElement("tbody");
            for (const workOrder of responseJSON.workOrders) {
                resultsTbodyElement.insertAdjacentHTML("beforeend", "<tr>" +
                    ("<td>" +
                        '<a class="has-text-weight-bold" href="' +
                        urlPrefix +
                        "/workOrders/" +
                        workOrder.workOrderId +
                        '">' +
                        cityssm.escapeHTML(workOrder.workOrderNumber) +
                        "</a>" +
                        "</td>") +
                    ("<td>" +
                        cityssm.escapeHTML(workOrder.workOrderType) +
                        "</td>") +
                    "<td>" +
                    cityssm.escapeHTML(workOrder.workOrderDescription) +
                    "</td>" +
                    ("<td>" +
                        workOrder.workOrderOpenDateString +
                        "</td>") +
                    ("<td>" +
                        (workOrder.workOrderCloseDate
                            ? workOrder.workOrderCloseDateString
                            : '<span class="has-text-grey">(No Close Date)</span>') +
                        "</td>") +
                    "</tr>");
            }
            searchResultsContainerElement.innerHTML =
                '<table class="table is-fullwidth is-striped is-hoverable">' +
                    "<thead><tr>" +
                    "<th>Work Order Number</th>" +
                    "<th>Work Order Type</th>" +
                    "<th>Work Order Description</th>" +
                    "<th>Open Date</th>" +
                    "<th>Close Date</th>" +
                    "</tr></thead>" +
                    "<table>" +
                    '<div class="level">' +
                    ('<div class="level-left">' +
                        '<div class="level-item has-text-weight-bold">' +
                        "Displaying " +
                        (offset + 1).toString() +
                        " to " +
                        Math.min(responseJSON.count, limit + offset) +
                        " of " +
                        responseJSON.count +
                        "</div>" +
                        "</div>") +
                    ('<div class="level-right">' +
                        (offset > 0
                            ? '<div class="level-item">' +
                                '<button class="button is-rounded is-link is-outlined" data-page="previous" type="button" title="Previous">' +
                                '<i class="fas fa-arrow-left" aria-hidden="true"></i>' +
                                "</button>" +
                                "</div>"
                            : "") +
                        (limit + offset < responseJSON.count
                            ? '<div class="level-item">' +
                                '<button class="button is-rounded is-link" data-page="next" type="button" title="Next">' +
                                "<span>Next</span>" +
                                '<span class="icon"><i class="fas fa-arrow-right" aria-hidden="true"></i></span>' +
                                "</button>" +
                                "</div>"
                            : "") +
                        "</div>") +
                    "</div>";
            searchResultsContainerElement
                .querySelector("table")
                .append(resultsTbodyElement);
            if (offset > 0) {
                searchResultsContainerElement
                    .querySelector("button[data-page='previous']")
                    .addEventListener("click", previousAndGetWorkOrders);
            }
            if (limit + offset < responseJSON.count) {
                searchResultsContainerElement
                    .querySelector("button[data-page='next']")
                    .addEventListener("click", nextAndGetWorkOrders);
            }
        });
    };
    const resetOffsetAndGetWorkOrders = () => {
        offsetElement.value = "0";
        getWorkOrders();
    };
    const previousAndGetWorkOrders = () => {
        offsetElement.value = Math.max(Number.parseInt(offsetElement.value, 10) - limit, 0).toString();
        getWorkOrders();
    };
    const nextAndGetWorkOrders = () => {
        offsetElement.value = (Number.parseInt(offsetElement.value, 10) + limit).toString();
        getWorkOrders();
    };
    const filterElements = searchFilterFormElement.querySelectorAll("input, select");
    for (const filterElement of filterElements) {
        filterElement.addEventListener("change", resetOffsetAndGetWorkOrders);
    }
    searchFilterFormElement.addEventListener("submit", (formEvent) => {
        formEvent.preventDefault();
        resetOffsetAndGetWorkOrders();
    });
    getWorkOrders();
})();
