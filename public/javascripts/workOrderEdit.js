"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const los = exports.los;
    const workOrderId = document.querySelector('#workOrderEdit--workOrderId').value;
    const isCreate = workOrderId === '';
    const workOrderFormElement = document.querySelector('#form--workOrderEdit');
    los.initializeDatePickers(workOrderFormElement
        .querySelector('#workOrderEdit--workOrderOpenDateString')
        ?.closest('.field'));
    los.initializeUnlockFieldButtons(workOrderFormElement);
    function setUnsavedChanges() {
        los.setUnsavedChanges();
        document
            .querySelector("button[type='submit'][form='form--workOrderEdit']")
            ?.classList.remove('is-light');
    }
    function clearUnsavedChanges() {
        los.clearUnsavedChanges();
        document
            .querySelector("button[type='submit'][form='form--workOrderEdit']")
            ?.classList.add('is-light');
    }
    workOrderFormElement.addEventListener('submit', (submitEvent) => {
        submitEvent.preventDefault();
        cityssm.postJSON(`${los.urlPrefix}/workOrders/${isCreate ? 'doCreateWorkOrder' : 'doUpdateWorkOrder'}`, submitEvent.currentTarget, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                clearUnsavedChanges();
                if (isCreate) {
                    globalThis.location.href = los.getWorkOrderURL(responseJSON.workOrderId, true);
                }
                else {
                    bulmaJS.alert({
                        message: 'Work Order Updated Successfully',
                        contextualColorName: 'success'
                    });
                }
            }
            else {
                bulmaJS.alert({
                    title: 'Error Updating Work Order',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
                });
            }
        });
    });
    const inputElements = workOrderFormElement.querySelectorAll('input, select, textarea');
    for (const inputElement of inputElements) {
        inputElement.addEventListener('change', setUnsavedChanges);
    }
    /*
     * Work Order Options
     */
    function doClose() {
        cityssm.postJSON(`${los.urlPrefix}/workOrders/doCloseWorkOrder`, {
            workOrderId
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                clearUnsavedChanges();
                globalThis.location.href = los.getWorkOrderURL(workOrderId);
            }
            else {
                bulmaJS.alert({
                    title: 'Error Closing Work Order',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    function doDelete() {
        cityssm.postJSON(`${los.urlPrefix}/workOrders/doDeleteWorkOrder`, {
            workOrderId
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                clearUnsavedChanges();
                globalThis.location.href = `${los.urlPrefix}/workOrders`;
            }
            else {
                bulmaJS.alert({
                    title: 'Error Deleting Work Order',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    let workOrderMilestones;
    document
        .querySelector('#button--closeWorkOrder')
        ?.addEventListener('click', () => {
        const hasOpenMilestones = workOrderMilestones.some((milestone) => !milestone.workOrderMilestoneCompletionDate);
        if (hasOpenMilestones) {
            bulmaJS.alert({
                title: 'Outstanding Milestones',
                message: `You cannot close a work order with outstanding milestones.
            Either complete the outstanding milestones, or remove them from the work order.`,
                contextualColorName: 'warning'
            });
            /*
              // Disable closing work orders with open milestones
              bulmaJS.confirm({
                title: "Close Work Order with Outstanding Milestones",
                message:
                  "Are you sure you want to close this work order with outstanding milestones?",
                contextualColorName: "danger",
                okButton: {
                  text: "Yes, Close Work Order",
                  callbackFunction: doClose
                }
              });
          */
        }
        else {
            bulmaJS.confirm({
                title: 'Close Work Order',
                message: los.hasUnsavedChanges()
                    ? 'Are you sure you want to close this work order with unsaved changes?'
                    : 'Are you sure you want to close this work order?',
                contextualColorName: los.hasUnsavedChanges() ? 'warning' : 'info',
                okButton: {
                    text: 'Yes, Close Work Order',
                    callbackFunction: doClose
                }
            });
        }
    });
    document
        .querySelector('#button--deleteWorkOrder')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        bulmaJS.confirm({
            title: 'Delete Work Order',
            message: 'Are you sure you want to delete this work order?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete Work Order',
                callbackFunction: doDelete
            }
        });
    });
    /**
     * Related Lots
     */
    if (!isCreate) {
        ;
        (() => {
            let workOrderLots = exports.workOrderLots;
            delete exports.workOrderLots;
            let workOrderLotOccupancies = exports.workOrderLotOccupancies;
            delete exports.workOrderLotOccupancies;
            function deleteLotOccupancy(clickEvent) {
                const lotOccupancyId = clickEvent.currentTarget.closest('.container--lotOccupancy').dataset.lotOccupancyId;
                function doDelete() {
                    cityssm.postJSON(`${los.urlPrefix}/workOrders/doDeleteWorkOrderLotOccupancy`, {
                        workOrderId,
                        lotOccupancyId
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            workOrderLotOccupancies = responseJSON.workOrderLotOccupancies;
                            renderRelatedLotsAndOccupancies();
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Deleting Relationship',
                                message: responseJSON.errorMessage ?? '',
                                contextualColorName: 'danger'
                            });
                        }
                    });
                }
                bulmaJS.confirm({
                    title: `Delete ${los.escapedAliases.Occupancy} Relationship`,
                    message: `Are you sure you want to remove the relationship to this ${los.escapedAliases.occupancy} record from this work order?  Note that the record will remain.`,
                    contextualColorName: 'warning',
                    okButton: {
                        text: 'Yes, Delete Relationship',
                        callbackFunction: doDelete
                    }
                });
            }
            function addLot(lotId, callbackFunction) {
                cityssm.postJSON(`${los.urlPrefix}/workOrders/doAddWorkOrderLot`, {
                    workOrderId,
                    lotId
                }, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        workOrderLots = responseJSON.workOrderLots;
                        renderRelatedLotsAndOccupancies();
                    }
                    else {
                        bulmaJS.alert({
                            title: `Error Adding ${los.escapedAliases.Lot}`,
                            message: responseJSON.errorMessage ?? '',
                            contextualColorName: 'danger'
                        });
                    }
                    if (callbackFunction !== undefined) {
                        callbackFunction(responseJSON.success);
                    }
                });
            }
            function addLotOccupancy(lotOccupancyId, callbackFunction) {
                cityssm.postJSON(`${los.urlPrefix}/workOrders/doAddWorkOrderLotOccupancy`, {
                    workOrderId,
                    lotOccupancyId
                }, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        workOrderLotOccupancies = responseJSON.workOrderLotOccupancies;
                        renderRelatedLotsAndOccupancies();
                    }
                    else {
                        bulmaJS.alert({
                            title: `Error Adding ${los.escapedAliases.Occupancy}`,
                            message: responseJSON.errorMessage ?? '',
                            contextualColorName: 'danger'
                        });
                    }
                    if (callbackFunction !== undefined) {
                        callbackFunction(responseJSON.success);
                    }
                });
            }
            function addLotFromLotOccupancy(clickEvent) {
                const lotId = clickEvent.currentTarget.dataset.lotId ?? '';
                addLot(lotId);
            }
            function renderRelatedOccupancies() {
                const occupanciesContainerElement = document.querySelector('#container--lotOccupancies');
                document.querySelector(".tabs a[href='#relatedTab--lotOccupancies'] .tag").textContent = workOrderLotOccupancies.length.toString();
                if (workOrderLotOccupancies.length === 0) {
                    // eslint-disable-next-line no-unsanitized/property
                    occupanciesContainerElement.innerHTML = `<div class="message is-info">
            <p class="message-body">There are no ${los.escapedAliases.occupancies} associated with this work order.</p>
            </div>`;
                    return;
                }
                // eslint-disable-next-line no-unsanitized/property
                occupanciesContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
          <thead><tr>
            <th class="has-width-1"></th>
            <th>${los.escapedAliases.Occupancy} Type</th>
            <th>${los.escapedAliases.Lot}</th>
            <th>${los.escapedAliases.OccupancyStartDate}</th>
            <th>End Date</th>
            <th>${los.escapedAliases.Occupants}</th>
            <th class="has-width-1"></th>
          </tr></thead>
          <tbody></tbody>
          </table>`;
                const currentDateString = cityssm.dateToString(new Date());
                for (const lotOccupancy of workOrderLotOccupancies) {
                    const rowElement = document.createElement('tr');
                    rowElement.className = 'container--lotOccupancy';
                    rowElement.dataset.lotOccupancyId =
                        lotOccupancy.lotOccupancyId.toString();
                    const isActive = !(lotOccupancy.occupancyEndDate &&
                        lotOccupancy.occupancyEndDateString < currentDateString);
                    const hasLotRecord = lotOccupancy.lotId &&
                        workOrderLots.some((lot) => lotOccupancy.lotId === lot.lotId);
                    // eslint-disable-next-line no-unsanitized/property
                    rowElement.innerHTML = `<td class="is-width-1 has-text-centered">
      ${isActive
                        ? `<i class="fas fa-play" title="Current ${los.escapedAliases.Occupancy}"></i>`
                        : `<i class="fas fa-stop" title="Previous ${los.escapedAliases.Occupancy}"></i>`}
      </td><td>
        <a class="has-text-weight-bold" href="${los.getLotOccupancyURL(lotOccupancy.lotOccupancyId)}">
          ${cityssm.escapeHTML(lotOccupancy.occupancyType ?? '')}
        </a><br />
        <span class="is-size-7">#${lotOccupancy.lotOccupancyId}</span>
      </td>`;
                    if (lotOccupancy.lotId) {
                        // eslint-disable-next-line no-unsanitized/method
                        rowElement.insertAdjacentHTML('beforeend', `<td>
          ${cityssm.escapeHTML(lotOccupancy.lotName ?? '')}
          ${hasLotRecord
                            ? ''
                            : ` <button class="button is-small is-light is-success button--addLot"
                  data-lot-id="${lotOccupancy.lotId.toString()}"
                  data-tooltip="Add ${los.escapedAliases.Lot}"
                  aria-label="Add ${los.escapedAliases.Lot}" type="button">
                  <i class="fas fa-plus" aria-hidden="true"></i>
                  </button>`}
        </td>`);
                    }
                    else {
                        // eslint-disable-next-line no-unsanitized/method
                        rowElement.insertAdjacentHTML('beforeend', `<td><span class="has-text-grey">(No ${los.escapedAliases.Lot})</span></td>`);
                    }
                    let occupantsHTML = '';
                    for (const occupant of lotOccupancy.lotOccupancyOccupants) {
                        occupantsHTML += `<li class="has-tooltip-left"
              data-tooltip="${cityssm.escapeHTML(occupant.lotOccupantType ?? '')}">
              <span class="fa-li">
              <i class="fas fa-fw fa-${cityssm.escapeHTML((occupant.fontAwesomeIconClass ?? '') === ''
                            ? 'user'
                            : occupant.fontAwesomeIconClass ?? '')}" aria-label="${los.escapedAliases.Occupant}"></i>
              </span>
              ${cityssm.escapeHTML(occupant.occupantName ?? '')}
              ${cityssm.escapeHTML(occupant.occupantFamilyName ?? '')}
              </li>`;
                    }
                    // eslint-disable-next-line no-unsanitized/method
                    rowElement.insertAdjacentHTML('beforeend', `<td>
          ${lotOccupancy.occupancyStartDateString}
        </td><td>
          ${lotOccupancy.occupancyEndDate
                        ? lotOccupancy.occupancyEndDateString
                        : '<span class="has-text-grey">(No End Date)</span>'}
        </td><td>
          ${lotOccupancy.lotOccupancyOccupants.length === 0
                        ? `<span class="has-text-grey">(No ${los.escapedAliases.Occupants})</span>`
                        : `<ul class="fa-ul ml-5">${occupantsHTML}</ul>`}
        </td><td>
          <button class="button is-small is-light is-danger button--deleteLotOccupancy" data-tooltip="Delete Relationship" type="button">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </td>`);
                    rowElement
                        .querySelector('.button--addLot')
                        ?.addEventListener('click', addLotFromLotOccupancy);
                    rowElement
                        .querySelector('.button--deleteLotOccupancy')
                        ?.addEventListener('click', deleteLotOccupancy);
                    occupanciesContainerElement.querySelector('tbody')?.append(rowElement);
                }
            }
            function openEditLotStatus(clickEvent) {
                const lotId = Number.parseInt(clickEvent.currentTarget.closest('.container--lot').dataset.lotId ?? '', 10);
                const lot = workOrderLots.find((possibleLot) => possibleLot.lotId === lotId);
                let editCloseModalFunction;
                function doUpdateLotStatus(submitEvent) {
                    submitEvent.preventDefault();
                    cityssm.postJSON(`${los.urlPrefix}/workOrders/doUpdateLotStatus`, submitEvent.currentTarget, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            workOrderLots = responseJSON.workOrderLots;
                            renderRelatedLotsAndOccupancies();
                            editCloseModalFunction();
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Deleting Relationship',
                                message: responseJSON.errorMessage ?? '',
                                contextualColorName: 'danger'
                            });
                        }
                    });
                }
                cityssm.openHtmlModal('lot-editLotStatus', {
                    onshow(modalElement) {
                        los.populateAliases(modalElement);
                        modalElement.querySelector('#lotStatusEdit--lotId').value = lotId.toString();
                        modalElement.querySelector('#lotStatusEdit--lotName').value = lot.lotName ?? '';
                        const lotStatusElement = modalElement.querySelector('#lotStatusEdit--burialSiteStatusId');
                        let lotStatusFound = false;
                        for (const lotStatus of exports.lotStatuses) {
                            const optionElement = document.createElement('option');
                            optionElement.value = lotStatus.burialSiteStatusId.toString();
                            optionElement.textContent = lotStatus.lotStatus;
                            if (lotStatus.burialSiteStatusId === lot.burialSiteStatusId) {
                                lotStatusFound = true;
                            }
                            lotStatusElement.append(optionElement);
                        }
                        if (!lotStatusFound && lot.burialSiteStatusId) {
                            const optionElement = document.createElement('option');
                            optionElement.value = lot.burialSiteStatusId.toString();
                            optionElement.textContent = lot.lotStatus ?? '';
                            lotStatusElement.append(optionElement);
                        }
                        if (lot.burialSiteStatusId) {
                            lotStatusElement.value = lot.burialSiteStatusId.toString();
                        }
                        // eslint-disable-next-line no-unsanitized/method
                        modalElement
                            .querySelector('form')
                            ?.insertAdjacentHTML('beforeend', `<input name="workOrderId" type="hidden" value="${workOrderId}" />`);
                    },
                    onshown(modalElement, closeModalFunction) {
                        editCloseModalFunction = closeModalFunction;
                        bulmaJS.toggleHtmlClipped();
                        modalElement
                            .querySelector('form')
                            ?.addEventListener('submit', doUpdateLotStatus);
                    },
                    onremoved() {
                        bulmaJS.toggleHtmlClipped();
                    }
                });
            }
            function deleteLot(clickEvent) {
                const lotId = clickEvent.currentTarget.closest('.container--lot').dataset.lotId;
                function doDelete() {
                    cityssm.postJSON(`${los.urlPrefix}/workOrders/doDeleteWorkOrderLot`, {
                        workOrderId,
                        lotId
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            workOrderLots = responseJSON.workOrderLots;
                            renderRelatedLotsAndOccupancies();
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Deleting Relationship',
                                message: responseJSON.errorMessage ?? '',
                                contextualColorName: 'danger'
                            });
                        }
                    });
                }
                bulmaJS.confirm({
                    title: `Delete ${los.escapedAliases.Occupancy} Relationship`,
                    message: `Are you sure you want to remove the relationship to this ${los.escapedAliases.occupancy} record from this work order?  Note that the record will remain.`,
                    contextualColorName: 'warning',
                    okButton: {
                        text: 'Yes, Delete Relationship',
                        callbackFunction: doDelete
                    }
                });
            }
            function renderRelatedLots() {
                const lotsContainerElement = document.querySelector('#container--lots');
                document.querySelector(".tabs a[href='#relatedTab--lots'] .tag").textContent = workOrderLots.length.toString();
                if (workOrderLots.length === 0) {
                    // eslint-disable-next-line no-unsanitized/property
                    lotsContainerElement.innerHTML = `<div class="message is-info">
            <p class="message-body">There are no ${los.escapedAliases.lots} associated with this work order.</p>
            </div>`;
                    return;
                }
                // eslint-disable-next-line no-unsanitized/property
                lotsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
          <thead><tr>
            <th>${los.escapedAliases.Lot}</th>
            <th>${los.escapedAliases.Map}</th>
            <th>${los.escapedAliases.Lot} Type</th>
            <th>Status</th>
            <th class="has-width-1"></th>
          </tr></thead>
          <tbody></tbody>
          </table>`;
                for (const lot of workOrderLots) {
                    const rowElement = document.createElement('tr');
                    rowElement.className = 'container--lot';
                    rowElement.dataset.lotId = lot.lotId.toString();
                    // eslint-disable-next-line no-unsanitized/property
                    rowElement.innerHTML = `<td>
              <a class="has-text-weight-bold" href="${los.getLotURL(lot.lotId)}">
                ${cityssm.escapeHTML(lot.lotName ?? '')}
              </a>
            </td><td>
              ${cityssm.escapeHTML(lot.mapName ?? '')}
            </td><td>
              ${cityssm.escapeHTML(lot.lotType ?? '')}
            </td><td>
              ${lot.burialSiteStatusId
                        ? cityssm.escapeHTML(lot.lotStatus ?? '')
                        : '<span class="has-text-grey">(No Status)</span>'}
            </td><td class="is-nowrap">
              <button class="button is-small is-light is-info button--editLotStatus" data-tooltip="Update Status" type="button">
              <i class="fas fa-pencil-alt" aria-hidden="true"></i>
              </button>
              <button class="button is-small is-light is-danger button--deleteLot" data-tooltip="Delete Relationship" type="button">
              <i class="fas fa-trash" aria-hidden="true"></i>
              </button>
            </td>`;
                    rowElement
                        .querySelector('.button--editLotStatus')
                        ?.addEventListener('click', openEditLotStatus);
                    rowElement
                        .querySelector('.button--deleteLot')
                        ?.addEventListener('click', deleteLot);
                    lotsContainerElement.querySelector('tbody')?.append(rowElement);
                }
            }
            function renderRelatedLotsAndOccupancies() {
                renderRelatedOccupancies();
                renderRelatedLots();
            }
            renderRelatedLotsAndOccupancies();
            function doAddLotOccupancy(clickEvent) {
                const rowElement = clickEvent.currentTarget.closest('tr');
                const lotOccupancyId = rowElement.dataset.lotOccupancyId ?? '';
                addLotOccupancy(lotOccupancyId, (success) => {
                    if (success) {
                        rowElement.remove();
                    }
                });
            }
            document
                .querySelector('#button--addLotOccupancy')
                ?.addEventListener('click', () => {
                let searchFormElement;
                let searchResultsContainerElement;
                function doSearch(event) {
                    if (event) {
                        event.preventDefault();
                    }
                    // eslint-disable-next-line no-unsanitized/property
                    searchResultsContainerElement.innerHTML =
                        los.getLoadingParagraphHTML('Searching...');
                    cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doSearchLotOccupancies`, searchFormElement, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.lotOccupancies.length === 0) {
                            searchResultsContainerElement.innerHTML = `<div class="message is-info">
                    <p class="message-body">There are no records that meet the search criteria.</p>
                    </div>`;
                            return;
                        }
                        // eslint-disable-next-line no-unsanitized/property
                        searchResultsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
                  <thead><tr>
                    <th class="has-width-1"></th>
                    <th>${los.escapedAliases.Occupancy} Type</th>
                    <th>${los.escapedAliases.Lot}</th>
                    <th>${los.escapedAliases.OccupancyStartDate}</th>
                    <th>End Date</th>
                    <th>${los.escapedAliases.Occupants}</th>
                  </tr></thead>
                  <tbody></tbody>
                  </table>`;
                        for (const lotOccupancy of responseJSON.lotOccupancies) {
                            const rowElement = document.createElement('tr');
                            rowElement.className = 'container--lotOccupancy';
                            rowElement.dataset.lotOccupancyId =
                                lotOccupancy.lotOccupancyId.toString();
                            rowElement.innerHTML = `<td class="has-text-centered">
                      <button class="button is-small is-success button--addLotOccupancy" data-tooltip="Add" type="button" aria-label="Add">
                        <i class="fas fa-plus" aria-hidden="true"></i>
                      </button>
                    </td>
                    <td class="has-text-weight-bold">
                      ${cityssm.escapeHTML(lotOccupancy.occupancyType ?? '')}
                    </td>`;
                            if (lotOccupancy.lotId) {
                                rowElement.insertAdjacentHTML('beforeend', `<td>${cityssm.escapeHTML(lotOccupancy.lotName ?? '')}</td>`);
                            }
                            else {
                                // eslint-disable-next-line no-unsanitized/method
                                rowElement.insertAdjacentHTML('beforeend', `<td><span class="has-text-grey">(No ${los.escapedAliases.Lot})</span></td>`);
                            }
                            // eslint-disable-next-line no-unsanitized/method
                            rowElement.insertAdjacentHTML('beforeend', `<td>
                  ${lotOccupancy.occupancyStartDateString}
                </td><td>
                  ${lotOccupancy.occupancyEndDate
                                ? lotOccupancy.occupancyEndDateString
                                : '<span class="has-text-grey">(No End Date)</span>'}
                </td><td>
                  ${lotOccupancy.lotOccupancyOccupants.length === 0
                                ? `<span class="has-text-grey">
                          (No ${cityssm.escapeHTML(los.escapedAliases.Occupants)})
                          </span>`
                                : cityssm.escapeHTML(`${lotOccupancy.lotOccupancyOccupants[0].occupantName}
                            ${lotOccupancy.lotOccupancyOccupants[0]
                                    .occupantFamilyName}`) +
                                    (lotOccupancy.lotOccupancyOccupants.length > 1
                                        ? ` plus
                              ${(lotOccupancy.lotOccupancyOccupants.length - 1).toString()}`
                                        : '')}</td>`);
                            rowElement
                                .querySelector('.button--addLotOccupancy')
                                ?.addEventListener('click', doAddLotOccupancy);
                            searchResultsContainerElement
                                .querySelector('tbody')
                                ?.append(rowElement);
                        }
                    });
                }
                cityssm.openHtmlModal('workOrder-addLotOccupancy', {
                    onshow(modalElement) {
                        los.populateAliases(modalElement);
                        searchFormElement = modalElement.querySelector('form');
                        searchResultsContainerElement = modalElement.querySelector('#resultsContainer--lotOccupancyAdd');
                        modalElement.querySelector('#lotOccupancySearch--notWorkOrderId').value = workOrderId;
                        modalElement.querySelector('#lotOccupancySearch--occupancyEffectiveDateString').value = document.querySelector('#workOrderEdit--workOrderOpenDateString').value;
                        doSearch();
                    },
                    onshown(modalElement) {
                        bulmaJS.toggleHtmlClipped();
                        const occupantNameElement = modalElement.querySelector('#lotOccupancySearch--occupantName');
                        occupantNameElement.addEventListener('change', doSearch);
                        occupantNameElement.focus();
                        modalElement.querySelector('#lotOccupancySearch--lotName').addEventListener('change', doSearch);
                        searchFormElement.addEventListener('submit', doSearch);
                    },
                    onremoved() {
                        bulmaJS.toggleHtmlClipped();
                        document.querySelector('#button--addLotOccupancy').focus();
                    }
                });
            });
            function doAddLot(clickEvent) {
                const rowElement = clickEvent.currentTarget.closest('tr');
                const lotId = rowElement.dataset.lotId ?? '';
                addLot(lotId, (success) => {
                    if (success) {
                        rowElement.remove();
                    }
                });
            }
            document
                .querySelector('#button--addLot')
                ?.addEventListener('click', () => {
                let searchFormElement;
                let searchResultsContainerElement;
                function doSearch(event) {
                    if (event) {
                        event.preventDefault();
                    }
                    // eslint-disable-next-line no-unsanitized/property
                    searchResultsContainerElement.innerHTML =
                        los.getLoadingParagraphHTML('Searching...');
                    cityssm.postJSON(`${los.urlPrefix}/lots/doSearchLots`, searchFormElement, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.lots.length === 0) {
                            searchResultsContainerElement.innerHTML = `<div class="message is-info">
            <p class="message-body">There are no records that meet the search criteria.</p>
            </div>`;
                            return;
                        }
                        // eslint-disable-next-line no-unsanitized/property
                        searchResultsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
                  <thead><tr>
                    <th class="has-width-1"></th>
                    <th>${los.escapedAliases.Lot}</th>
                    <th>${los.escapedAliases.Map}</th>
                    <th>${los.escapedAliases.Lot} Type</th>
                    <th>Status</th>
                  </tr></thead>
                  <tbody></tbody>
                  </table>`;
                        for (const lot of responseJSON.lots) {
                            const rowElement = document.createElement('tr');
                            rowElement.className = 'container--lot';
                            rowElement.dataset.lotId = lot.lotId.toString();
                            rowElement.innerHTML = `<td class="has-text-centered">
                      <button class="button is-small is-success button--addLot" data-tooltip="Add" type="button" aria-label="Add">
                        <i class="fas fa-plus" aria-hidden="true"></i>
                      </button>
                    </td><td class="has-text-weight-bold">
                      ${cityssm.escapeHTML(lot.lotName ?? '')}
                    </td><td>
                      ${cityssm.escapeHTML(lot.mapName ?? '')}
                    </td><td>
                      ${cityssm.escapeHTML(lot.lotType ?? '')}
                    </td><td>
                      ${cityssm.escapeHTML(lot.lotStatus ?? '')}
                    </td>`;
                            rowElement
                                .querySelector('.button--addLot')
                                ?.addEventListener('click', doAddLot);
                            searchResultsContainerElement
                                .querySelector('tbody')
                                ?.append(rowElement);
                        }
                    });
                }
                cityssm.openHtmlModal('workOrder-addLot', {
                    onshow(modalElement) {
                        los.populateAliases(modalElement);
                        searchFormElement = modalElement.querySelector('form');
                        searchResultsContainerElement = modalElement.querySelector('#resultsContainer--lotAdd');
                        modalElement.querySelector('#lotSearch--notWorkOrderId').value = workOrderId;
                        const lotStatusElement = modalElement.querySelector('#lotSearch--burialSiteStatusId');
                        for (const lotStatus of exports.lotStatuses) {
                            const optionElement = document.createElement('option');
                            optionElement.value = lotStatus.burialSiteStatusId.toString();
                            optionElement.textContent = lotStatus.lotStatus;
                            lotStatusElement.append(optionElement);
                        }
                        doSearch();
                    },
                    onshown(modalElement) {
                        bulmaJS.toggleHtmlClipped();
                        const lotNameElement = modalElement.querySelector('#lotSearch--lotName');
                        lotNameElement.addEventListener('change', doSearch);
                        lotNameElement.focus();
                        modalElement
                            .querySelector('#lotSearch--burialSiteStatusId')
                            ?.addEventListener('change', doSearch);
                        searchFormElement.addEventListener('submit', doSearch);
                    },
                    onremoved() {
                        bulmaJS.toggleHtmlClipped();
                        document.querySelector('#button--addLot').focus();
                    }
                });
            });
        })();
    }
    /**
     * Comments
     */
    ;
    (() => {
        let workOrderComments = exports.workOrderComments;
        delete exports.workOrderComments;
        function openEditWorkOrderComment(clickEvent) {
            const workOrderCommentId = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
                .workOrderCommentId ?? '', 10);
            const workOrderComment = workOrderComments.find((currentComment) => currentComment.workOrderCommentId === workOrderCommentId);
            let editFormElement;
            let editCloseModalFunction;
            function editComment(submitEvent) {
                submitEvent.preventDefault();
                cityssm.postJSON(`${los.urlPrefix}/workOrders/doUpdateWorkOrderComment`, editFormElement, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        workOrderComments = responseJSON.workOrderComments;
                        editCloseModalFunction();
                        renderWorkOrderComments();
                    }
                    else {
                        bulmaJS.alert({
                            title: 'Error Updating Comment',
                            message: responseJSON.errorMessage ?? '',
                            contextualColorName: 'danger'
                        });
                    }
                });
            }
            cityssm.openHtmlModal('workOrder-editComment', {
                onshow(modalElement) {
                    ;
                    modalElement.querySelector('#workOrderCommentEdit--workOrderId').value = workOrderId;
                    modalElement.querySelector('#workOrderCommentEdit--workOrderCommentId').value = workOrderCommentId.toString();
                    modalElement.querySelector('#workOrderCommentEdit--workOrderComment').value = workOrderComment.workOrderComment ?? '';
                    const workOrderCommentDateStringElement = modalElement.querySelector('#workOrderCommentEdit--workOrderCommentDateString');
                    workOrderCommentDateStringElement.value =
                        workOrderComment.workOrderCommentDateString ?? '';
                    const currentDateString = cityssm.dateToString(new Date());
                    workOrderCommentDateStringElement.max =
                        workOrderComment.workOrderCommentDateString <= currentDateString
                            ? currentDateString
                            : workOrderComment.workOrderCommentDateString ?? '';
                    modalElement.querySelector('#workOrderCommentEdit--workOrderCommentTimeString').value = workOrderComment.workOrderCommentTimeString ?? '';
                },
                onshown(modalElement, closeModalFunction) {
                    bulmaJS.toggleHtmlClipped();
                    los.initializeDatePickers(modalElement);
                    modalElement.querySelector('#workOrderCommentEdit--workOrderComment').focus();
                    editFormElement = modalElement.querySelector('form');
                    editFormElement.addEventListener('submit', editComment);
                    editCloseModalFunction = closeModalFunction;
                },
                onremoved() {
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        function deleteWorkOrderComment(clickEvent) {
            const workOrderCommentId = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
                .workOrderCommentId ?? '', 10);
            function doDelete() {
                cityssm.postJSON(`${los.urlPrefix}/workOrders/doDeleteWorkOrderComment`, {
                    workOrderId,
                    workOrderCommentId
                }, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        workOrderComments = responseJSON.workOrderComments;
                        renderWorkOrderComments();
                    }
                    else {
                        bulmaJS.alert({
                            title: 'Error Removing Comment',
                            message: responseJSON.errorMessage ?? '',
                            contextualColorName: 'danger'
                        });
                    }
                });
            }
            bulmaJS.confirm({
                title: 'Remove Comment?',
                message: 'Are you sure you want to remove this comment?',
                okButton: {
                    text: 'Yes, Remove Comment',
                    callbackFunction: doDelete
                },
                contextualColorName: 'warning'
            });
        }
        function renderWorkOrderComments() {
            const containerElement = document.querySelector('#container--workOrderComments');
            if (workOrderComments.length === 0) {
                containerElement.innerHTML = `<div class="message is-info">
      <p class="message-body">There are no comments to display.</p>
      </div>`;
                return;
            }
            const tableElement = document.createElement('table');
            tableElement.className = 'table is-fullwidth is-striped is-hoverable';
            tableElement.innerHTML = `<thead><tr>
        <th>Commentor</th>
        <th>Comment Date</th>
        <th>Comment</th>
        <th class="is-hidden-print"><span class="is-sr-only">Options</span></th>
        </tr></thead>
        <tbody></tbody>`;
            for (const workOrderComment of workOrderComments) {
                const tableRowElement = document.createElement('tr');
                tableRowElement.dataset.workOrderCommentId =
                    workOrderComment.workOrderCommentId?.toString();
                // eslint-disable-next-line no-unsanitized/property
                tableRowElement.innerHTML = `<td>
            ${cityssm.escapeHTML(workOrderComment.recordCreate_userName ?? '')}
          </td><td>
            ${workOrderComment.workOrderCommentDateString}
            ${workOrderComment.workOrderCommentTime === 0
                    ? ''
                    : workOrderComment.workOrderCommentTimePeriodString}
          </td><td>
            ${cityssm.escapeHTML(workOrderComment.workOrderComment ?? '')}
          </td><td class="is-hidden-print">
            <div class="buttons are-small is-justify-content-end">
              <button class="button is-primary button--edit" type="button">
                <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
                <span>Edit</span>
              </button>
              <button class="button is-light is-danger button--delete" data-tooltip="Delete Comment" type="button" aria-label="Delete">
                <i class="fas fa-trash" aria-hidden="true"></i>
              </button>
            </div>
          </td>`;
                tableRowElement
                    .querySelector('.button--edit')
                    ?.addEventListener('click', openEditWorkOrderComment);
                tableRowElement
                    .querySelector('.button--delete')
                    ?.addEventListener('click', deleteWorkOrderComment);
                tableElement.querySelector('tbody')?.append(tableRowElement);
            }
            containerElement.innerHTML = '';
            containerElement.append(tableElement);
        }
        function openAddCommentModal() {
            let addCommentCloseModalFunction;
            function doAddComment(formEvent) {
                formEvent.preventDefault();
                cityssm.postJSON(`${los.urlPrefix}/workOrders/doAddWorkOrderComment`, formEvent.currentTarget, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        workOrderComments = responseJSON.workOrderComments;
                        renderWorkOrderComments();
                        addCommentCloseModalFunction();
                    }
                });
            }
            cityssm.openHtmlModal('workOrder-addComment', {
                onshow(modalElement) {
                    los.populateAliases(modalElement);
                    modalElement.querySelector('#workOrderCommentAdd--workOrderId').value = workOrderId;
                    modalElement
                        .querySelector('form')
                        ?.addEventListener('submit', doAddComment);
                },
                onshown(modalElement, closeModalFunction) {
                    bulmaJS.toggleHtmlClipped();
                    addCommentCloseModalFunction = closeModalFunction;
                    modalElement.querySelector('#workOrderCommentAdd--workOrderComment').focus();
                },
                onremoved() {
                    bulmaJS.toggleHtmlClipped();
                    document.querySelector('#workOrderComments--add').focus();
                }
            });
        }
        document
            .querySelector('#workOrderComments--add')
            ?.addEventListener('click', openAddCommentModal);
        if (!isCreate) {
            renderWorkOrderComments();
        }
    })();
    /*
     * Milestones
     */
    function clearPanelBlockElements(panelElement) {
        for (const panelBlockElement of panelElement.querySelectorAll('.panel-block')) {
            panelBlockElement.remove();
        }
    }
    function refreshConflictingMilestones(workOrderMilestoneDateString, targetPanelElement) {
        // Clear panel-block elements
        clearPanelBlockElements(targetPanelElement);
        // eslint-disable-next-line no-unsanitized/method
        targetPanelElement.insertAdjacentHTML('beforeend', `<div class="panel-block is-block">
      ${los.getLoadingParagraphHTML('Loading conflicting milestones...')}
      </div>`);
        cityssm.postJSON(`${los.urlPrefix}/workOrders/doGetWorkOrderMilestones`, {
            workOrderMilestoneDateFilter: 'date',
            workOrderMilestoneDateString
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            const workOrderMilestones = responseJSON.workOrderMilestones.filter((possibleMilestone) => possibleMilestone.workOrderId.toString() !== workOrderId);
            clearPanelBlockElements(targetPanelElement);
            for (const milestone of workOrderMilestones) {
                targetPanelElement.insertAdjacentHTML('beforeend', `<div class="panel-block is-block">
              <div class="columns">
                <div class="column is-5">
                  ${cityssm.escapeHTML(milestone.workOrderMilestoneTime === 0 ? 'No Time' : milestone.workOrderMilestoneTimePeriodString ?? '')}<br />
                  <strong>${cityssm.escapeHTML(milestone.workOrderMilestoneType ?? '')}</strong>
                </div>
                <div class="column">
                  ${cityssm.escapeHTML(milestone.workOrderNumber ?? '')}<br />
                  <span class="is-size-7">
                    ${cityssm.escapeHTML(milestone.workOrderDescription ?? '')}
                  </span>
                </div>
              </div>
              </div>`);
            }
            if (workOrderMilestones.length === 0) {
                targetPanelElement.insertAdjacentHTML('beforeend', `<div class="panel-block is-block">
              <div class="message is-info">
                <p class="message-body">
                  There are no milestones on other work orders scheduled for
                  ${cityssm.escapeHTML(workOrderMilestoneDateString)}.
                </p>
              </div>
              </div>`);
            }
        });
    }
    function processMilestoneResponse(rawResponseJSON) {
        const responseJSON = rawResponseJSON;
        if (responseJSON.success) {
            workOrderMilestones = responseJSON.workOrderMilestones;
            renderMilestones();
        }
        else {
            bulmaJS.alert({
                title: 'Error Reopening Milestone',
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
            });
        }
    }
    function completeMilestone(clickEvent) {
        clickEvent.preventDefault();
        const currentDateString = cityssm.dateToString(new Date());
        const workOrderMilestoneId = Number.parseInt(clickEvent.currentTarget.closest('.container--milestone').dataset.workOrderMilestoneId ?? '', 10);
        const workOrderMilestone = workOrderMilestones.find((currentMilestone) => currentMilestone.workOrderMilestoneId === workOrderMilestoneId);
        function doComplete() {
            cityssm.postJSON(`${los.urlPrefix}/workOrders/doCompleteWorkOrderMilestone`, {
                workOrderId,
                workOrderMilestoneId
            }, processMilestoneResponse);
        }
        bulmaJS.confirm({
            title: 'Complete Milestone',
            message: `Are you sure you want to complete this milestone?
        ${workOrderMilestone.workOrderMilestoneDateString !== undefined &&
                workOrderMilestone.workOrderMilestoneDateString !== '' &&
                workOrderMilestone.workOrderMilestoneDateString > currentDateString
                ? '<br /><strong>Note that this milestone is expected to be completed in the future.</strong>'
                : ''}`,
            messageIsHtml: true,
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Complete Milestone',
                callbackFunction: doComplete
            }
        });
    }
    function reopenMilestone(clickEvent) {
        clickEvent.preventDefault();
        const workOrderMilestoneId = clickEvent.currentTarget.closest('.container--milestone').dataset.workOrderMilestoneId;
        function doReopen() {
            cityssm.postJSON(`${los.urlPrefix}/workOrders/doReopenWorkOrderMilestone`, {
                workOrderId,
                workOrderMilestoneId
            }, processMilestoneResponse);
        }
        bulmaJS.confirm({
            title: 'Reopen Milestone',
            message: 'Are you sure you want to remove the completion status from this milestone, and reopen it?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Reopen Milestone',
                callbackFunction: doReopen
            }
        });
    }
    function deleteMilestone(clickEvent) {
        clickEvent.preventDefault();
        const workOrderMilestoneId = clickEvent.currentTarget.closest('.container--milestone').dataset.workOrderMilestoneId;
        function doDelete() {
            cityssm.postJSON(`${los.urlPrefix}/workOrders/doDeleteWorkOrderMilestone`, {
                workOrderMilestoneId,
                workOrderId
            }, processMilestoneResponse);
        }
        bulmaJS.confirm({
            title: 'Delete Milestone',
            message: 'Are you sure you want to delete this milestone?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete Milestone',
                callbackFunction: doDelete
            }
        });
    }
    function editMilestone(clickEvent) {
        clickEvent.preventDefault();
        const workOrderMilestoneId = Number.parseInt(clickEvent.currentTarget.closest('.container--milestone').dataset.workOrderMilestoneId ?? '', 10);
        const workOrderMilestone = workOrderMilestones.find((currentMilestone) => currentMilestone.workOrderMilestoneId === workOrderMilestoneId);
        let editCloseModalFunction;
        let workOrderMilestoneDateStringElement;
        function doEdit(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${los.urlPrefix}/workOrders/doUpdateWorkOrderMilestone`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                processMilestoneResponse(responseJSON);
                if (responseJSON.success) {
                    editCloseModalFunction();
                }
            });
        }
        cityssm.openHtmlModal('workOrder-editMilestone', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('#milestoneEdit--workOrderId').value = workOrderId;
                modalElement.querySelector('#milestoneEdit--workOrderMilestoneId').value = workOrderMilestone.workOrderMilestoneId?.toString() ?? '';
                const milestoneTypeElement = modalElement.querySelector('#milestoneEdit--workOrderMilestoneTypeId');
                let milestoneTypeFound = false;
                for (const milestoneType of exports.workOrderMilestoneTypes) {
                    const optionElement = document.createElement('option');
                    optionElement.value =
                        milestoneType.workOrderMilestoneTypeId.toString();
                    optionElement.textContent = milestoneType.workOrderMilestoneType;
                    if (milestoneType.workOrderMilestoneTypeId ===
                        workOrderMilestone.workOrderMilestoneTypeId) {
                        optionElement.selected = true;
                        milestoneTypeFound = true;
                    }
                    milestoneTypeElement.append(optionElement);
                }
                if (!milestoneTypeFound &&
                    workOrderMilestone.workOrderMilestoneTypeId) {
                    const optionElement = document.createElement('option');
                    optionElement.value =
                        workOrderMilestone.workOrderMilestoneTypeId.toString();
                    optionElement.textContent =
                        workOrderMilestone.workOrderMilestoneType ?? '';
                    optionElement.selected = true;
                    milestoneTypeElement.append(optionElement);
                }
                workOrderMilestoneDateStringElement = modalElement.querySelector('#milestoneEdit--workOrderMilestoneDateString');
                workOrderMilestoneDateStringElement.value =
                    workOrderMilestone.workOrderMilestoneDateString ?? '';
                if (workOrderMilestone.workOrderMilestoneTime) {
                    ;
                    modalElement.querySelector('#milestoneEdit--workOrderMilestoneTimeString').value = workOrderMilestone.workOrderMilestoneTimeString ?? '';
                }
                ;
                modalElement.querySelector('#milestoneEdit--workOrderMilestoneDescription').value = workOrderMilestone.workOrderMilestoneDescription ?? '';
            },
            onshown(modalElement, closeModalFunction) {
                editCloseModalFunction = closeModalFunction;
                bulmaJS.toggleHtmlClipped();
                los.initializeDatePickers(modalElement);
                // los.initializeTimePickers(modalElement);
                modalElement.querySelector('form')?.addEventListener('submit', doEdit);
                const conflictingMilestonePanelElement = document.querySelector('#milestoneEdit--conflictingMilestonesPanel');
                workOrderMilestoneDateStringElement.addEventListener('change', () => {
                    refreshConflictingMilestones(workOrderMilestoneDateStringElement.value, conflictingMilestonePanelElement);
                });
                refreshConflictingMilestones(workOrderMilestoneDateStringElement.value, conflictingMilestonePanelElement);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function renderMilestones() {
        // Clear milestones panel
        const milestonesPanelElement = document.querySelector('#panel--milestones');
        const panelBlockElementsToDelete = milestonesPanelElement.querySelectorAll('.panel-block');
        for (const panelBlockToDelete of panelBlockElementsToDelete) {
            panelBlockToDelete.remove();
        }
        for (const milestone of workOrderMilestones) {
            const panelBlockElement = document.createElement('div');
            panelBlockElement.className = 'panel-block is-block container--milestone';
            panelBlockElement.dataset.workOrderMilestoneId =
                milestone.workOrderMilestoneId?.toString();
            // eslint-disable-next-line no-unsanitized/property
            panelBlockElement.innerHTML = `<div class="columns is-mobile">
        <div class="column is-narrow">
          ${milestone.workOrderMilestoneCompletionDate
                ? `<span class="button is-static"
                  data-tooltip="Completed ${milestone.workOrderMilestoneCompletionDateString}"
                  aria-label="Completed ${milestone.workOrderMilestoneCompletionDateString}">
                  <span class="icon is-small"><i class="fas fa-check" aria-hidden="true"></i></span>
                  </span>`
                : `<button class="button button--completeMilestone" data-tooltip="Incomplete" type="button" aria-label="Incomplete">
                  <span class="icon is-small"><i class="far fa-square" aria-hidden="true"></i></span>
                  </button>`}
        </div><div class="column">
          ${milestone.workOrderMilestoneTypeId
                ? `<strong>${cityssm.escapeHTML(milestone.workOrderMilestoneType ?? '')}</strong><br />`
                : ''}
          ${milestone.workOrderMilestoneDate === 0
                ? '<span class="has-text-grey">(No Set Date)</span>'
                : milestone.workOrderMilestoneDateString}
          ${milestone.workOrderMilestoneTime
                ? ` ${milestone.workOrderMilestoneTimePeriodString}`
                : ''}<br />
          <span class="is-size-7">
            ${cityssm.escapeHTML(milestone.workOrderMilestoneDescription ?? '')}
          </span>
        </div><div class="column is-narrow">
          <div class="dropdown is-right">
            <div class="dropdown-trigger">
              <button class="button is-small" data-tooltip="Options" type="button" aria-label="Options">
                <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
              </button>
            </div>
            <div class="dropdown-menu">
              <div class="dropdown-content">
                ${milestone.workOrderMilestoneCompletionDate
                ? `<a class="dropdown-item button--reopenMilestone" href="#">
                        <span class="icon is-small"><i class="fas fa-times" aria-hidden="true"></i></span>
                        <span>Reopen Milestone</span>
                        </a>`
                : `<a class="dropdown-item button--editMilestone" href="#">
                        <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
                        <span>Edit Milestone</span>
                        </a>`}
                <hr class="dropdown-divider" />
                <a class="dropdown-item button--deleteMilestone" href="#">
                  <span class="icon is-small"><i class="fas fa-trash has-text-danger" aria-hidden="true"></i></span>
                  <span>Delete Milestone</span>
                </a>
              </div>
            </div>
          </div>
        </div></div>`;
            panelBlockElement
                .querySelector('.button--reopenMilestone')
                ?.addEventListener('click', reopenMilestone);
            panelBlockElement
                .querySelector('.button--editMilestone')
                ?.addEventListener('click', editMilestone);
            panelBlockElement
                .querySelector('.button--completeMilestone')
                ?.addEventListener('click', completeMilestone);
            panelBlockElement
                .querySelector('.button--deleteMilestone')
                ?.addEventListener('click', deleteMilestone);
            milestonesPanelElement.append(panelBlockElement);
        }
        bulmaJS.init(milestonesPanelElement);
    }
    if (!isCreate) {
        workOrderMilestones = exports.workOrderMilestones;
        delete exports.workOrderMilestones;
        renderMilestones();
        document
            .querySelector('#button--addMilestone')
            ?.addEventListener('click', () => {
            let addFormElement;
            let workOrderMilestoneDateStringElement;
            let addCloseModalFunction;
            function doAdd(submitEvent) {
                if (submitEvent) {
                    submitEvent.preventDefault();
                }
                const currentDateString = cityssm.dateToString(new Date());
                function _doAdd() {
                    cityssm.postJSON(`${los.urlPrefix}/workOrders/doAddWorkOrderMilestone`, addFormElement, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        processMilestoneResponse(responseJSON);
                        if (responseJSON.success) {
                            addCloseModalFunction();
                        }
                    });
                }
                const milestoneDateString = workOrderMilestoneDateStringElement.value;
                if (milestoneDateString !== '' &&
                    milestoneDateString < currentDateString) {
                    bulmaJS.confirm({
                        title: 'Milestone Date in the Past',
                        message: 'Are you sure you want to create a milestone with a date in the past?',
                        contextualColorName: 'warning',
                        okButton: {
                            text: 'Yes, Create a Past Milestone',
                            callbackFunction: _doAdd
                        }
                    });
                }
                else {
                    _doAdd();
                }
            }
            cityssm.openHtmlModal('workOrder-addMilestone', {
                onshow(modalElement) {
                    ;
                    modalElement.querySelector('#milestoneAdd--workOrderId').value = workOrderId;
                    const milestoneTypeElement = modalElement.querySelector('#milestoneAdd--workOrderMilestoneTypeId');
                    for (const milestoneType of exports.workOrderMilestoneTypes) {
                        const optionElement = document.createElement('option');
                        optionElement.value =
                            milestoneType.workOrderMilestoneTypeId.toString();
                        optionElement.textContent = milestoneType.workOrderMilestoneType;
                        milestoneTypeElement.append(optionElement);
                    }
                    workOrderMilestoneDateStringElement = modalElement.querySelector('#milestoneAdd--workOrderMilestoneDateString');
                    workOrderMilestoneDateStringElement.valueAsDate = new Date();
                },
                onshown(modalElement, closeModalFunction) {
                    addCloseModalFunction = closeModalFunction;
                    los.initializeDatePickers(modalElement);
                    // los.initializeTimePickers(modalElement);
                    bulmaJS.toggleHtmlClipped();
                    modalElement.querySelector('#milestoneAdd--workOrderMilestoneTypeId').focus();
                    addFormElement = modalElement.querySelector('form');
                    addFormElement.addEventListener('submit', doAdd);
                    const conflictingMilestonePanelElement = document.querySelector('#milestoneAdd--conflictingMilestonesPanel');
                    workOrderMilestoneDateStringElement.addEventListener('change', () => {
                        refreshConflictingMilestones(workOrderMilestoneDateStringElement.value, conflictingMilestonePanelElement);
                    });
                    refreshConflictingMilestones(workOrderMilestoneDateStringElement.value, conflictingMilestonePanelElement);
                },
                onremoved() {
                    bulmaJS.toggleHtmlClipped();
                    document.querySelector('#button--addMilestone').focus();
                }
            });
        });
    }
})();
