/* eslint-disable @typescript-eslint/no-non-null-assertion, unicorn/prefer-module */

import type * as globalTypes from "../types/globalTypes";
import type * as recordTypes from "../types/recordTypes";

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";

declare const cityssm: cityssmGlobal;

(() => {
    const los = exports.los as globalTypes.LOS;

    const maps: recordTypes.Map[] = exports.maps;

    const searchFilterElement = document.querySelector("#searchFilter--map") as HTMLInputElement;

    const searchResultsContainerElement = document.querySelector(
        "#container--searchResults"
    ) as HTMLElement;

    const renderResults = () => {
        searchResultsContainerElement.innerHTML = los.getLoadingParagraphHTML(
            `Loading ${exports.aliases.maps}...`
        );

        let searchResultCount = 0;
        const searchResultsTbodyElement = document.createElement("tbody");

        const filterStringSplit = searchFilterElement.value.trim().toLowerCase().split(" ");

        for (const map of maps) {
            const mapSearchString = (
                map.mapName +
                " " +
                map.mapDescription +
                " " +
                map.mapAddress1 +
                " " +
                map.mapAddress2
            ).toLowerCase();

            let showMap = true;

            for (const filterStringPiece of filterStringSplit) {
                if (!mapSearchString.includes(filterStringPiece)) {
                    showMap = false;
                    break;
                }
            }

            if (!showMap) {
                continue;
            }

            searchResultCount += 1;

            searchResultsTbodyElement.insertAdjacentHTML(
                "beforeend",
                "<tr>" +
                    ("<td>" +
                        '<a class="has-text-weight-bold" href="' +
                        los.urlPrefix +
                        "/maps/" +
                        map.mapId +
                        '">' +
                        cityssm.escapeHTML(map.mapName || "(No Name)") +
                        "</a><br />" +
                        '<span class="is-size-7">' +
                        cityssm.escapeHTML(map.mapDescription || "") +
                        "</span>" +
                        "</td>") +
                    ("<td>" +
                        (map.mapAddress1 ? cityssm.escapeHTML(map.mapAddress1) + "<br />" : "") +
                        (map.mapAddress2 ? cityssm.escapeHTML(map.mapAddress2) + "<br />" : "") +
                        (map.mapCity || map.mapProvince
                            ? cityssm.escapeHTML(map.mapCity || "") +
                              ", " +
                              cityssm.escapeHTML(map.mapProvince || "") +
                              "<br />"
                            : "") +
                        (map.mapPostalCode ? cityssm.escapeHTML(map.mapPostalCode) : "") +
                        "</td>") +
                    ("<td>" + cityssm.escapeHTML(map.mapPhoneNumber || "") + "</td>") +
                    '<td class="has-text-centered">' +
                    (map.mapLatitude && map.mapLongitude
                        ? '<span data-tooltip="Has Geographic Coordinates"><i class="fas fa-map-marker-alt" aria-label="Has Geographic Coordinates"></i></span>'
                        : "") +
                    "</td>" +
                    '<td class="has-text-centered">' +
                    (map.mapSVG
                        ? '<span data-tooltip="Has Image"><i class="fas fa-image" aria-label="Has Image"></i></span>'
                        : "") +
                    "</td>" +
                    ('<td class="has-text-right">' +
                        '<a href="' +
                        los.urlPrefix +
                        "/lots?mapId=" +
                        map.mapId +
                        '">' +
                        map.lotCount +
                        "</a>" +
                        "</td>") +
                    "</tr>"
            );
        }

        searchResultsContainerElement.innerHTML = "";

        if (searchResultCount === 0) {
            searchResultsContainerElement.innerHTML = `<div class="message is-info">
                <p class="message-body">There are no ${los.escapedAliases.maps} that meet the search criteria.</p>
                </div>`;
        } else {
            const searchResultsTableElement = document.createElement("table");

            searchResultsTableElement.className =
                "table is-fullwidth is-striped is-hoverable has-sticky-header";

            searchResultsTableElement.innerHTML =
                "<thead><tr>" +
                ("<th>" + exports.aliases.map + "</th>") +
                "<th>Address</th>" +
                "<th>Phone Number</th>" +
                '<th class="has-text-centered">Coordinates</th>' +
                '<th class="has-text-centered">Image</th>' +
                ('<th class="has-text-right">' + exports.aliases.lot + " Count</th>") +
                "</tr></thead>";

            searchResultsTableElement.append(searchResultsTbodyElement);

            searchResultsContainerElement.append(searchResultsTableElement);
        }
    };

    searchFilterElement.addEventListener("keyup", renderResults);

    (document.querySelector("#form--searchFilters") as HTMLFormElement).addEventListener(
        "submit",
        (formEvent) => {
            formEvent.preventDefault();
            renderResults();
        }
    );

    renderResults();
})();
