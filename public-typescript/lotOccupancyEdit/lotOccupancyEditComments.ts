/* eslint-disable @typescript-eslint/no-non-null-assertion, unicorn/prefer-module */

import type * as globalTypes from "../../types/globalTypes";
import type * as recordTypes from "../../types/recordTypes";

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";

import type { BulmaJS } from "@cityssm/bulma-js/types";

declare const cityssm: cityssmGlobal;
declare const bulmaJS: BulmaJS;

declare const los: globalTypes.LOS;

declare const lotOccupancyId: string;

let lotOccupancyComments: recordTypes.LotOccupancyComment[] = exports.lotOccupancyComments;
delete exports.lotOccupancyComments;

const openEditLotOccupancyComment = (clickEvent: Event) => {
    const lotOccupancyCommentId = Number.parseInt(
        (clickEvent.currentTarget as HTMLElement).closest("tr")!.dataset.lotOccupancyCommentId!,
        10
    );

    const lotOccupancyComment = lotOccupancyComments.find((currentLotOccupancyComment) => {
        return currentLotOccupancyComment.lotOccupancyCommentId === lotOccupancyCommentId;
    })!;

    let editFormElement: HTMLFormElement;
    let editCloseModalFunction: () => void;

    const editComment = (submitEvent: SubmitEvent) => {
        submitEvent.preventDefault();

        cityssm.postJSON(
            los.urlPrefix + "/lotOccupancies/doUpdateLotOccupancyComment",
            editFormElement,
            (responseJSON: {
                success: boolean;
                errorMessage?: string;
                lotOccupancyComments?: recordTypes.LotOccupancyComment[];
            }) => {
                if (responseJSON.success) {
                    lotOccupancyComments = responseJSON.lotOccupancyComments!;
                    editCloseModalFunction();
                    renderLotOccupancyComments();
                } else {
                    bulmaJS.alert({
                        title: "Error Updating Comment",
                        message: responseJSON.errorMessage || "",
                        contextualColorName: "danger"
                    });
                }
            }
        );
    };

    cityssm.openHtmlModal("lotOccupancy-editComment", {
        onshow: (modalElement) => {
            los.populateAliases(modalElement);

            (
                modalElement.querySelector(
                    "#lotOccupancyCommentEdit--lotOccupancyId"
                ) as HTMLInputElement
            ).value = lotOccupancyId;
            (
                modalElement.querySelector(
                    "#lotOccupancyCommentEdit--lotOccupancyCommentId"
                ) as HTMLInputElement
            ).value = lotOccupancyCommentId.toString();

            (
                modalElement.querySelector(
                    "#lotOccupancyCommentEdit--lotOccupancyComment"
                ) as HTMLInputElement
            ).value = lotOccupancyComment.lotOccupancyComment!;

            const lotOccupancyCommentDateStringElement = modalElement.querySelector(
                "#lotOccupancyCommentEdit--lotOccupancyCommentDateString"
            ) as HTMLInputElement;

            lotOccupancyCommentDateStringElement.value =
                lotOccupancyComment.lotOccupancyCommentDateString!;

            const currentDateString = cityssm.dateToString(new Date());

            lotOccupancyCommentDateStringElement.max =
                lotOccupancyComment.lotOccupancyCommentDateString! <= currentDateString
                    ? currentDateString
                    : lotOccupancyComment.lotOccupancyCommentDateString!;

            (
                modalElement.querySelector(
                    "#lotOccupancyCommentEdit--lotOccupancyCommentTimeString"
                ) as HTMLInputElement
            ).value = lotOccupancyComment.lotOccupancyCommentTimeString!;
        },
        onshown: (modalElement, closeModalFunction) => {
            bulmaJS.toggleHtmlClipped();

            los.initializeDatePickers(modalElement);
            // los.initializeTimePickers(modalElement);

            (
                modalElement.querySelector(
                    "#lotOccupancyCommentEdit--lotOccupancyComment"
                ) as HTMLTextAreaElement
            ).focus();

            editFormElement = modalElement.querySelector("form")!;
            editFormElement.addEventListener("submit", editComment);

            editCloseModalFunction = closeModalFunction;
        },
        onremoved: () => {
            bulmaJS.toggleHtmlClipped();
        }
    });
};

const deleteLotOccupancyComment = (clickEvent: Event) => {
    const lotOccupancyCommentId = Number.parseInt(
        (clickEvent.currentTarget as HTMLElement).closest("tr")!.dataset.lotOccupancyCommentId!,
        10
    );

    const doDelete = () => {
        cityssm.postJSON(
            los.urlPrefix + "/lotOccupancies/doDeleteLotOccupancyComment",
            {
                lotOccupancyId,
                lotOccupancyCommentId
            },
            (responseJSON: {
                success: boolean;
                errorMessage?: string;
                lotOccupancyComments: recordTypes.LotOccupancyComment[];
            }) => {
                if (responseJSON.success) {
                    lotOccupancyComments = responseJSON.lotOccupancyComments;
                    renderLotOccupancyComments();
                } else {
                    bulmaJS.alert({
                        title: "Error Removing Comment",
                        message: responseJSON.errorMessage || "",
                        contextualColorName: "danger"
                    });
                }
            }
        );
    };

    bulmaJS.confirm({
        title: "Remove Comment?",
        message: "Are you sure you want to remove this comment?",
        okButton: {
            text: "Yes, Remove Comment",
            callbackFunction: doDelete
        },
        contextualColorName: "warning"
    });
};

const renderLotOccupancyComments = () => {
    const containerElement = document.querySelector(
        "#container--lotOccupancyComments"
    ) as HTMLElement;

    if (lotOccupancyComments.length === 0) {
        containerElement.innerHTML =
            '<div class="message is-info">' +
            '<p class="message-body">There are no comments associated with this record.</p>' +
            "</div>";
        return;
    }

    const tableElement = document.createElement("table");
    tableElement.className = "table is-fullwidth is-striped is-hoverable";
    tableElement.innerHTML =
        "<thead><tr>" +
        "<th>Commentor</th>" +
        "<th>Comment Date</th>" +
        "<th>Comment</th>" +
        '<th class="is-hidden-print"><span class="is-sr-only">Options</span></th>' +
        "</tr></thead>" +
        "<tbody></tbody>";

    for (const lotOccupancyComment of lotOccupancyComments) {
        const tableRowElement = document.createElement("tr");
        tableRowElement.dataset.lotOccupancyCommentId =
            lotOccupancyComment.lotOccupancyCommentId!.toString();

        tableRowElement.innerHTML =
            "<td>" +
            cityssm.escapeHTML(lotOccupancyComment.recordCreate_userName || "") +
            "</td>" +
            "<td>" +
            lotOccupancyComment.lotOccupancyCommentDateString +
            (lotOccupancyComment.lotOccupancyCommentTime === 0
                ? ""
                : " " + lotOccupancyComment.lotOccupancyCommentTimeString) +
            "</td>" +
            "<td>" +
            cityssm.escapeHTML(lotOccupancyComment.lotOccupancyComment || "") +
            "</td>" +
            ('<td class="is-hidden-print">' +
                '<div class="buttons are-small is-justify-content-end">' +
                ('<button class="button is-primary button--edit" type="button">' +
                    '<span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>' +
                    " <span>Edit</span>" +
                    "</button>") +
                ('<button class="button is-light is-danger button--delete" data-tooltip="Delete Comment" type="button" aria-label="Delete">' +
                    '<i class="fas fa-trash" aria-hidden="true"></i>' +
                    "</button>") +
                "</div>" +
                "</td>");

        tableRowElement
            .querySelector(".button--edit")!
            .addEventListener("click", openEditLotOccupancyComment);

        tableRowElement
            .querySelector(".button--delete")!
            .addEventListener("click", deleteLotOccupancyComment);

        tableElement.querySelector("tbody")!.append(tableRowElement);
    }

    containerElement.innerHTML = "";
    containerElement.append(tableElement);
};

document.querySelector("#button--addComment")!.addEventListener("click", () => {
    let addFormElement: HTMLFormElement;
    let addCloseModalFunction: () => void;

    const addComment = (submitEvent: SubmitEvent) => {
        submitEvent.preventDefault();

        cityssm.postJSON(
            los.urlPrefix + "/lotOccupancies/doAddLotOccupancyComment",
            addFormElement,
            (responseJSON: {
                success: boolean;
                errorMessage?: string;
                lotOccupancyComments?: recordTypes.LotOccupancyComment[];
            }) => {
                if (responseJSON.success) {
                    lotOccupancyComments = responseJSON.lotOccupancyComments!;
                    addCloseModalFunction();
                    renderLotOccupancyComments();
                } else {
                    bulmaJS.alert({
                        title: "Error Adding Comment",
                        message: responseJSON.errorMessage || "",
                        contextualColorName: "danger"
                    });
                }
            }
        );
    };

    cityssm.openHtmlModal("lotOccupancy-addComment", {
        onshow: (modalElement) => {
            los.populateAliases(modalElement);

            (
                modalElement.querySelector(
                    "#lotOccupancyCommentAdd--lotOccupancyId"
                ) as HTMLInputElement
            ).value = lotOccupancyId;
        },
        onshown: (modalElement, closeModalFunction) => {
            bulmaJS.toggleHtmlClipped();

            (
                modalElement.querySelector(
                    "#lotOccupancyCommentAdd--lotOccupancyComment"
                ) as HTMLTextAreaElement
            ).focus();

            addFormElement = modalElement.querySelector("form")!;
            addFormElement.addEventListener("submit", addComment);

            addCloseModalFunction = closeModalFunction;
        },
        onremoved: () => {
            bulmaJS.toggleHtmlClipped();
        }
    });
});

renderLotOccupancyComments();
