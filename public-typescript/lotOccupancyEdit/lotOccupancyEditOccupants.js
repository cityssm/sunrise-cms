"use strict";
/* eslint-disable @typescript-eslint/no-non-null-assertion, unicorn/prefer-module */
Object.defineProperty(exports, "__esModule", { value: true });
let lotOccupancyOccupants;
function openEditLotOccupancyOccupant(clickEvent) {
    const lotOccupantIndex = Number.parseInt(clickEvent.currentTarget.closest('tr').dataset
        .lotOccupantIndex, 10);
    const lotOccupancyOccupant = lotOccupancyOccupants.find((currentLotOccupancyOccupant) => {
        return currentLotOccupancyOccupant.lotOccupantIndex === lotOccupantIndex;
    });
    let editFormElement;
    let editCloseModalFunction;
    function editOccupant(submitEvent) {
        submitEvent.preventDefault();
        cityssm.postJSON(los.urlPrefix + '/lotOccupancies/doUpdateLotOccupancyOccupant', editFormElement, (responseJSON) => {
            var _a;
            if (responseJSON.success) {
                lotOccupancyOccupants = responseJSON.lotOccupancyOccupants;
                editCloseModalFunction();
                renderLotOccupancyOccupants();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Updating ' + los.escapedAliases.Occupant,
                    message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : '',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    cityssm.openHtmlModal('lotOccupancy-editOccupant', {
        onshow(modalElement) {
            var _a;
            los.populateAliases(modalElement);
            modalElement.querySelector('#lotOccupancyOccupantEdit--lotOccupancyId').value = lotOccupancyId;
            modalElement.querySelector('#lotOccupancyOccupantEdit--lotOccupantIndex').value = lotOccupantIndex.toString();
            const lotOccupantTypeSelectElement = modalElement.querySelector('#lotOccupancyOccupantEdit--lotOccupantTypeId');
            let lotOccupantTypeSelected = false;
            for (const lotOccupantType of exports.lotOccupantTypes) {
                const optionElement = document.createElement('option');
                optionElement.value = lotOccupantType.lotOccupantTypeId.toString();
                optionElement.textContent = lotOccupantType.lotOccupantType;
                optionElement.dataset.occupantCommentTitle =
                    lotOccupantType.occupantCommentTitle;
                if (lotOccupantType.lotOccupantTypeId ===
                    lotOccupancyOccupant.lotOccupantTypeId) {
                    optionElement.selected = true;
                    lotOccupantTypeSelected = true;
                }
                lotOccupantTypeSelectElement.append(optionElement);
            }
            if (!lotOccupantTypeSelected) {
                const optionElement = document.createElement('option');
                optionElement.value = lotOccupancyOccupant.lotOccupantTypeId.toString();
                optionElement.textContent = lotOccupancyOccupant.lotOccupantType;
                optionElement.dataset.occupantCommentTitle =
                    lotOccupancyOccupant.occupantCommentTitle;
                optionElement.selected = true;
                lotOccupantTypeSelectElement.append(optionElement);
            }
            ;
            modalElement.querySelector('#lotOccupancyOccupantEdit--occupantName').value = lotOccupancyOccupant.occupantName;
            modalElement.querySelector('#lotOccupancyOccupantEdit--occupantAddress1').value = lotOccupancyOccupant.occupantAddress1;
            modalElement.querySelector('#lotOccupancyOccupantEdit--occupantAddress2').value = lotOccupancyOccupant.occupantAddress2;
            modalElement.querySelector('#lotOccupancyOccupantEdit--occupantCity').value = lotOccupancyOccupant.occupantCity;
            modalElement.querySelector('#lotOccupancyOccupantEdit--occupantProvince').value = lotOccupancyOccupant.occupantProvince;
            modalElement.querySelector('#lotOccupancyOccupantEdit--occupantPostalCode').value = lotOccupancyOccupant.occupantPostalCode;
            modalElement.querySelector('#lotOccupancyOccupantEdit--occupantPhoneNumber').value = lotOccupancyOccupant.occupantPhoneNumber;
            modalElement.querySelector('#lotOccupancyOccupantEdit--occupantEmailAddress').value = lotOccupancyOccupant.occupantEmailAddress;
            modalElement.querySelector('#lotOccupancyOccupantEdit--occupantCommentTitle').textContent =
                ((_a = lotOccupancyOccupant.occupantCommentTitle) !== null && _a !== void 0 ? _a : '') === ''
                    ? 'Comment'
                    : lotOccupancyOccupant.occupantCommentTitle;
            modalElement.querySelector('#lotOccupancyOccupantEdit--occupantComment').value = lotOccupancyOccupant.occupantComment;
        },
        onshown(modalElement, closeModalFunction) {
            bulmaJS.toggleHtmlClipped();
            const lotOccupantTypeIdElement = modalElement.querySelector('#lotOccupancyOccupantEdit--lotOccupantTypeId');
            lotOccupantTypeIdElement.focus();
            lotOccupantTypeIdElement.addEventListener('change', () => {
                var _a;
                let occupantCommentTitle = (_a = lotOccupantTypeIdElement.selectedOptions[0].dataset
                    .occupantCommentTitle) !== null && _a !== void 0 ? _a : '';
                if (occupantCommentTitle === '') {
                    occupantCommentTitle = 'Comment';
                }
                ;
                modalElement.querySelector('#lotOccupancyOccupantEdit--occupantCommentTitle').textContent = occupantCommentTitle;
            });
            editFormElement = modalElement.querySelector('form');
            editFormElement.addEventListener('submit', editOccupant);
            editCloseModalFunction = closeModalFunction;
        },
        onremoved() {
            bulmaJS.toggleHtmlClipped();
        }
    });
}
function deleteLotOccupancyOccupant(clickEvent) {
    const lotOccupantIndex = clickEvent.currentTarget.closest('tr').dataset.lotOccupantIndex;
    function doDelete() {
        cityssm.postJSON(los.urlPrefix + '/lotOccupancies/doDeleteLotOccupancyOccupant', {
            lotOccupancyId,
            lotOccupantIndex
        }, (responseJSON) => {
            var _a;
            if (responseJSON.success) {
                lotOccupancyOccupants = responseJSON.lotOccupancyOccupants;
                renderLotOccupancyOccupants();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Removing ' + los.escapedAliases.Occupant,
                    message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : '',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    bulmaJS.confirm({
        title: `Remove ${los.escapedAliases.Occupant}?`,
        message: `Are you sure you want to remove this ${los.escapedAliases.occupant}?`,
        okButton: {
            text: 'Yes, Remove ' + los.escapedAliases.Occupant,
            callbackFunction: doDelete
        },
        contextualColorName: 'warning'
    });
}
function renderLotOccupancyOccupants() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const occupantsContainer = document.querySelector('#container--lotOccupancyOccupants');
    cityssm.clearElement(occupantsContainer);
    if (lotOccupancyOccupants.length === 0) {
        occupantsContainer.innerHTML = `<div class="message is-warning">
        <p class="message-body">There are no ${los.escapedAliases.occupants} associated with this record.</p>
        </div>`;
        return;
    }
    const tableElement = document.createElement('table');
    tableElement.className = 'table is-fullwidth is-striped is-hoverable';
    tableElement.innerHTML = `<thead><tr>
      <th>${los.escapedAliases.Occupant}</th>
      <th>Address</th>
      <th>Other Contact</th>
      <th>Comment</th>
      <th class="is-hidden-print"><span class="is-sr-only">Options</span></th>
      </tr></thead>
      <tbody></tbody>`;
    for (const lotOccupancyOccupant of lotOccupancyOccupants) {
        const tableRowElement = document.createElement('tr');
        tableRowElement.dataset.lotOccupantIndex =
            lotOccupancyOccupant.lotOccupantIndex.toString();
        tableRowElement.innerHTML =
            '<td>' +
                cityssm.escapeHTML(((_a = lotOccupancyOccupant.occupantName) !== null && _a !== void 0 ? _a : '') === ''
                    ? '(No Name)'
                    : lotOccupancyOccupant.occupantName) +
                '<br />' +
                ('<span class="tag">' +
                    '<i class="fas fa-fw fa-' +
                    cityssm.escapeHTML(lotOccupancyOccupant.fontAwesomeIconClass) +
                    '" aria-hidden="true"></i>' +
                    ' <span class="ml-1">' +
                    cityssm.escapeHTML(lotOccupancyOccupant.lotOccupantType) +
                    '</span>' +
                    '</span>') +
                '</td>' +
                ('<td>' +
                    (((_b = lotOccupancyOccupant.occupantAddress1) !== null && _b !== void 0 ? _b : '') === ''
                        ? ''
                        : cityssm.escapeHTML(lotOccupancyOccupant.occupantAddress1) +
                            '<br />') +
                    (((_c = lotOccupancyOccupant.occupantAddress2) !== null && _c !== void 0 ? _c : '') === ''
                        ? ''
                        : cityssm.escapeHTML(lotOccupancyOccupant.occupantAddress2) +
                            '<br />') +
                    (((_d = lotOccupancyOccupant.occupantCity) !== null && _d !== void 0 ? _d : '') === ''
                        ? ''
                        : cityssm.escapeHTML(lotOccupancyOccupant.occupantCity) + ', ') +
                    cityssm.escapeHTML((_e = lotOccupancyOccupant.occupantProvince) !== null && _e !== void 0 ? _e : '') +
                    '<br />' +
                    cityssm.escapeHTML((_f = lotOccupancyOccupant.occupantPostalCode) !== null && _f !== void 0 ? _f : '') +
                    '</td>') +
                ('<td>' +
                    (((_g = lotOccupancyOccupant.occupantPhoneNumber) !== null && _g !== void 0 ? _g : '') === ''
                        ? ''
                        : cityssm.escapeHTML(lotOccupancyOccupant.occupantPhoneNumber) +
                            '<br />') +
                    (((_h = lotOccupancyOccupant.occupantEmailAddress) !== null && _h !== void 0 ? _h : '') === ''
                        ? ''
                        : cityssm.escapeHTML(lotOccupancyOccupant.occupantEmailAddress)) +
                    '</td>') +
                ('<td>' +
                    '<span data-tooltip="' + cityssm.escapeHTML(((_j = lotOccupancyOccupant.occupantCommentTitle) !== null && _j !== void 0 ? _j : '') === '' ? 'Comment' : lotOccupancyOccupant.occupantCommentTitle) + '">' +
                    cityssm.escapeHTML((_k = lotOccupancyOccupant.occupantComment) !== null && _k !== void 0 ? _k : '') +
                    '</span>' +
                    '</td>') +
                ('<td class="is-hidden-print">' +
                    '<div class="buttons are-small is-justify-content-end">' +
                    ('<button class="button is-primary button--edit" type="button">' +
                        '<span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>' +
                        ' <span>Edit</span>' +
                        '</button>') +
                    ('<button class="button is-light is-danger button--delete" data-tooltip="Delete ' +
                        cityssm.escapeHTML(exports.aliases.occupant) +
                        '" type="button" aria-label="Delete">' +
                        '<i class="fas fa-trash" aria-hidden="true"></i>' +
                        '</button>') +
                    '</div>' +
                    '</td>');
        tableRowElement
            .querySelector('.button--edit')
            .addEventListener('click', openEditLotOccupancyOccupant);
        tableRowElement
            .querySelector('.button--delete')
            .addEventListener('click', deleteLotOccupancyOccupant);
        tableElement.querySelector('tbody').append(tableRowElement);
    }
    occupantsContainer.append(tableElement);
}
if (isCreate) {
    const lotOccupantTypeIdElement = document.querySelector('#lotOccupancy--lotOccupantTypeId');
    lotOccupantTypeIdElement.addEventListener('change', () => {
        const occupantFields = formElement.querySelectorAll("[data-table='LotOccupancyOccupant']");
        for (const occupantField of occupantFields) {
            occupantField.disabled = lotOccupantTypeIdElement.value === '';
        }
    });
}
else {
    lotOccupancyOccupants = exports.lotOccupancyOccupants;
    delete exports.lotOccupancyOccupants;
    document
        .querySelector('#button--addOccupant')
        .addEventListener('click', () => {
        let addCloseModalFunction;
        let addFormElement;
        let searchFormElement;
        let searchResultsElement;
        function addOccupant(formOrObject) {
            cityssm.postJSON(los.urlPrefix + '/lotOccupancies/doAddLotOccupancyOccupant', formOrObject, (responseJSON) => {
                var _a;
                if (responseJSON.success) {
                    lotOccupancyOccupants = responseJSON.lotOccupancyOccupants;
                    addCloseModalFunction();
                    renderLotOccupancyOccupants();
                }
                else {
                    bulmaJS.alert({
                        title: `Error Adding ${los.escapedAliases.Occupant}`,
                        message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : '',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        function addOccupantFromForm(submitEvent) {
            submitEvent.preventDefault();
            addOccupant(addFormElement);
        }
        let pastOccupantSearchResults = [];
        function addOccupantFromCopy(clickEvent) {
            clickEvent.preventDefault();
            const panelBlockElement = clickEvent.currentTarget;
            const occupant = pastOccupantSearchResults[Number.parseInt(panelBlockElement.dataset.index, 10)];
            const lotOccupantTypeId = panelBlockElement
                .closest('.modal')
                .querySelector('#lotOccupancyOccupantCopy--lotOccupantTypeId').value;
            if (lotOccupantTypeId === '') {
                bulmaJS.alert({
                    title: `No ${los.escapedAliases.Occupant} Type Selected`,
                    message: `Select a type to apply to the newly added ${los.escapedAliases.occupant}.`,
                    contextualColorName: 'warning'
                });
            }
            else {
                occupant.lotOccupantTypeId = Number.parseInt(lotOccupantTypeId, 10);
                occupant.lotOccupancyId = Number.parseInt(lotOccupancyId, 10);
                addOccupant(occupant);
            }
        }
        function searchOccupants(event) {
            event.preventDefault();
            if (searchFormElement.querySelector('#lotOccupancyOccupantCopy--searchFilter').value === '') {
                searchResultsElement.innerHTML =
                    '<div class="message is-info">' +
                        '<p class="message-body">Enter a partial name or address in the search field above.</p>' +
                        '</div>';
                return;
            }
            searchResultsElement.innerHTML =
                los.getLoadingParagraphHTML('Searching...');
            cityssm.postJSON(los.urlPrefix + '/lotOccupancies/doSearchPastOccupants', searchFormElement, (responseJSON) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                pastOccupantSearchResults = responseJSON.occupants;
                const panelElement = document.createElement('div');
                panelElement.className = 'panel';
                for (const [index, occupant] of pastOccupantSearchResults.entries()) {
                    const panelBlockElement = document.createElement('a');
                    panelBlockElement.className = 'panel-block is-block';
                    panelBlockElement.dataset.index = index.toString();
                    panelBlockElement.innerHTML =
                        '<strong>' +
                            cityssm.escapeHTML((_a = occupant.occupantName) !== null && _a !== void 0 ? _a : '') +
                            '</strong>' +
                            '<br />' +
                            '<div class="columns">' +
                            ('<div class="column">' +
                                cityssm.escapeHTML((_b = occupant.occupantAddress1) !== null && _b !== void 0 ? _b : '') +
                                '<br />' +
                                (((_c = occupant.occupantAddress2) !== null && _c !== void 0 ? _c : '') === ''
                                    ? ''
                                    : cityssm.escapeHTML(occupant.occupantAddress2) +
                                        '<br />') +
                                cityssm.escapeHTML((_d = occupant.occupantCity) !== null && _d !== void 0 ? _d : '') +
                                ', ' +
                                cityssm.escapeHTML((_e = occupant.occupantProvince) !== null && _e !== void 0 ? _e : '') +
                                '<br />' +
                                cityssm.escapeHTML((_f = occupant.occupantPostalCode) !== null && _f !== void 0 ? _f : '') +
                                '</div>') +
                            ('<div class="column">' +
                                (((_g = occupant.occupantPhoneNumber) !== null && _g !== void 0 ? _g : '') === ''
                                    ? ''
                                    : cityssm.escapeHTML(occupant.occupantPhoneNumber) +
                                        '<br />') +
                                cityssm.escapeHTML((_h = occupant.occupantEmailAddress) !== null && _h !== void 0 ? _h : '') +
                                '<br />' +
                                '</div>') +
                            '</div>';
                    panelBlockElement.addEventListener('click', addOccupantFromCopy);
                    panelElement.append(panelBlockElement);
                }
                searchResultsElement.innerHTML = '';
                searchResultsElement.append(panelElement);
            });
        }
        cityssm.openHtmlModal('lotOccupancy-addOccupant', {
            onshow(modalElement) {
                los.populateAliases(modalElement);
                modalElement.querySelector('#lotOccupancyOccupantAdd--lotOccupancyId').value = lotOccupancyId;
                const lotOccupantTypeSelectElement = modalElement.querySelector('#lotOccupancyOccupantAdd--lotOccupantTypeId');
                const lotOccupantTypeCopySelectElement = modalElement.querySelector('#lotOccupancyOccupantCopy--lotOccupantTypeId');
                for (const lotOccupantType of exports.lotOccupantTypes) {
                    const optionElement = document.createElement('option');
                    optionElement.value = lotOccupantType.lotOccupantTypeId.toString();
                    optionElement.textContent = lotOccupantType.lotOccupantType;
                    optionElement.dataset.occupantCommentTitle =
                        lotOccupantType.occupantCommentTitle;
                    lotOccupantTypeSelectElement.append(optionElement);
                    lotOccupantTypeCopySelectElement.append(optionElement.cloneNode(true));
                }
                ;
                modalElement.querySelector('#lotOccupancyOccupantAdd--occupantCity').value = exports.occupantCityDefault;
                modalElement.querySelector('#lotOccupancyOccupantAdd--occupantProvince').value = exports.occupantProvinceDefault;
            },
            onshown: (modalElement, closeModalFunction) => {
                bulmaJS.toggleHtmlClipped();
                bulmaJS.init(modalElement);
                const lotOccupantTypeIdElement = modalElement.querySelector('#lotOccupancyOccupantAdd--lotOccupantTypeId');
                lotOccupantTypeIdElement.focus();
                lotOccupantTypeIdElement.addEventListener('change', () => {
                    var _a;
                    let occupantCommentTitle = (_a = lotOccupantTypeIdElement.selectedOptions[0].dataset
                        .occupantCommentTitle) !== null && _a !== void 0 ? _a : '';
                    if (occupantCommentTitle === '') {
                        occupantCommentTitle = 'Comment';
                    }
                    modalElement.querySelector('#lotOccupancyOccupantAdd--occupantCommentTitle').textContent = occupantCommentTitle;
                });
                addFormElement = modalElement.querySelector('#form--lotOccupancyOccupantAdd');
                addFormElement.addEventListener('submit', addOccupantFromForm);
                searchResultsElement = modalElement.querySelector('#lotOccupancyOccupantCopy--searchResults');
                searchFormElement = modalElement.querySelector('#form--lotOccupancyOccupantCopy');
                searchFormElement.addEventListener('submit', (formEvent) => {
                    formEvent.preventDefault();
                });
                modalElement.querySelector('#lotOccupancyOccupantCopy--searchFilter').addEventListener('change', searchOccupants);
                addCloseModalFunction = closeModalFunction;
            },
            onremoved: () => {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    renderLotOccupancyOccupants();
}
