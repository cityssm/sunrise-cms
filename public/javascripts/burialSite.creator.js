;
(() => {
    const sunrise = exports.sunrise;
    const newResultsPanelElement = document.querySelector('#panel--burialSitePreview_new');
    const existingResultsPanelElement = document.querySelector('#panel--burialSitePreview_existing');
    const burialSiteElementSelector = '.panel-block.is-burial-site-block';
    const countElementSelector = '.panel-heading .tag';
    function updateCountElements() {
        const newResultsCountElement = newResultsPanelElement.querySelector(countElementSelector);
        const existingResultsCountElement = existingResultsPanelElement.querySelector(countElementSelector);
        // eslint-disable-next-line no-unsanitized/property
        newResultsCountElement.innerHTML = newResultsPanelElement
            .querySelectorAll(burialSiteElementSelector)
            .length.toString();
        // eslint-disable-next-line no-unsanitized/property
        existingResultsCountElement.innerHTML = existingResultsPanelElement
            .querySelectorAll(burialSiteElementSelector)
            .length.toString();
    }
    function clearPanel(panelElement) {
        const panelBlockElements = panelElement.querySelectorAll(burialSiteElementSelector);
        for (const panelBlockElement of panelBlockElements) {
            panelBlockElement.remove();
        }
    }
    function buildExistingBurialSitePanelBlockElement(burialSiteName, burialSiteId) {
        const panelBlockElement = document.createElement('div');
        panelBlockElement.className = 'panel-block is-burial-site-block';
        panelBlockElement.innerHTML = /* html */ `
      <div class="columns is-vcentered is-mobile">
        <div class="column is-narrow">
          <a
            class="button is-small is-primary"
            href="${sunrise.getBurialSiteUrl(burialSiteId)}"
            title="View Burial Site"
            target="_blank"
          >
            <span class="icon"><i class="fa-solid fa-eye"></i></span>
          </a>
        </div>
        <div class="column">
          ${cityssm.escapeHTML(burialSiteName)}
        </div>
      </div>
    `;
        return panelBlockElement;
    }
    function createBurialSite(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const burialSiteTypeId = document.querySelector('#burialSitePreview--burialSiteTypeId').value;
        if (burialSiteTypeId === '') {
            bulmaJS.alert({
                contextualColorName: 'warning',
                title: 'Burial Site Type Required',
                message: 'Please select a burial site type.'
            });
            return;
        }
        const burialSiteStatusId = document.querySelector('#burialSitePreview--burialSiteStatusId').value;
        if (burialSiteStatusId === '') {
            bulmaJS.alert({
                contextualColorName: 'warning',
                title: 'Burial Site Status Required',
                message: 'Please select a burial site status.'
            });
            return;
        }
        buttonElement.disabled = true;
        buttonElement.classList.add('is-loading');
        const panelBlockElement = buttonElement.closest(burialSiteElementSelector);
        const cemeteryId = panelBlockElement.dataset.cemeteryId;
        const burialSiteNameSegment1 = panelBlockElement.dataset
            .burialSiteNameSegment1;
        const burialSiteNameSegment2 = panelBlockElement.dataset
            .burialSiteNameSegment2;
        const burialSiteNameSegment3 = panelBlockElement.dataset
            .burialSiteNameSegment3;
        const burialSiteNameSegment4 = panelBlockElement.dataset
            .burialSiteNameSegment4;
        const burialSiteNameSegment5 = panelBlockElement.dataset
            .burialSiteNameSegment5;
        cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doCreateBurialSite`, {
            cemeteryId,
            burialSiteNameSegment1,
            burialSiteNameSegment2,
            burialSiteNameSegment3,
            burialSiteNameSegment4,
            burialSiteNameSegment5,
            burialSiteStatusId,
            burialSiteTypeId
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                panelBlockElement.remove();
                const newPanelBlockElement = buildExistingBurialSitePanelBlockElement(responseJSON.burialSiteName, responseJSON.burialSiteId);
                existingResultsPanelElement
                    .querySelector('.panel-block')
                    ?.insertAdjacentElement('afterend', newPanelBlockElement);
                updateCountElements();
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Creating Burial Site',
                    message: responseJSON.errorMessage ?? 'Unknown error.'
                });
                buttonElement.disabled = false;
                buttonElement.classList.remove('is-loading');
            }
        });
    }
    function renderBurialSiteNames(responseJSON) {
        clearPanel(newResultsPanelElement);
        clearPanel(existingResultsPanelElement);
        for (const burialSiteName of responseJSON.burialSiteNames) {
            if (burialSiteName.burialSiteId === undefined) {
                const panelBlockElement = document.createElement('div');
                panelBlockElement.className = 'panel-block is-burial-site-block';
                panelBlockElement.dataset.cemeteryId = responseJSON.cemeteryId;
                panelBlockElement.dataset.burialSiteName = burialSiteName.burialSiteName;
                panelBlockElement.dataset.burialSiteNameSegment1 =
                    burialSiteName.burialSiteNameSegment1;
                panelBlockElement.dataset.burialSiteNameSegment2 =
                    burialSiteName.burialSiteNameSegment2;
                panelBlockElement.dataset.burialSiteNameSegment3 =
                    burialSiteName.burialSiteNameSegment3;
                panelBlockElement.dataset.burialSiteNameSegment4 =
                    burialSiteName.burialSiteNameSegment4;
                panelBlockElement.dataset.burialSiteNameSegment5 =
                    burialSiteName.burialSiteNameSegment5;
                panelBlockElement.innerHTML = /* html */ `
          <div class="columns is-vcentered is-mobile">
            <div class="column is-narrow">
              <button class="button is-small is-success" type="button" title="Create Burial Site">
                <span class="icon"><i class="fa-solid fa-plus"></i></span>
              </button>
            </div>
            <div class="column">
              ${cityssm.escapeHTML(burialSiteName.burialSiteName)}
            </div>
          </div>
        `;
                panelBlockElement
                    .querySelector('button')
                    ?.addEventListener('click', createBurialSite);
                newResultsPanelElement.append(panelBlockElement);
            }
            else {
                existingResultsPanelElement.append(buildExistingBurialSitePanelBlockElement(burialSiteName.burialSiteName, burialSiteName.burialSiteId));
            }
        }
        if (responseJSON.burialSiteNames.length === 0) {
            bulmaJS.alert({
                contextualColorName: 'info',
                title: 'No Burial Site Names Generated',
                message: `No burial site names were generated for the selected range.
          Note that ranges may not generate more than ${responseJSON.burialSiteNameRangeLimit} names.`
            });
        }
        updateCountElements();
    }
    document
        .querySelector('#form--burialSiteCreator')
        ?.addEventListener('submit', (event) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        clearPanel(newResultsPanelElement);
        clearPanel(existingResultsPanelElement);
        updateCountElements();
        document.querySelector('#tab--burialSitePreview').click();
        cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doGetBurialSiteNamesByRange`, formElement, (rawResponseJSON) => {
            renderBurialSiteNames(rawResponseJSON);
        });
    });
    // Cemetery Key Preview
    const cemeteryKeyFromSpanElement = document.querySelector('#burialSiteCreator--cemeteryKey_from');
    if (cemeteryKeyFromSpanElement !== null) {
        const cemeteryKeyToSpanElement = document.querySelector('#burialSiteCreator--cemeteryKey_to');
        document
            .querySelector('#burialSiteCreator--cemeteryId')
            ?.addEventListener('change', (changeEvent) => {
            const cemeterySelectElement = changeEvent.currentTarget;
            const cemeteryKey = cemeterySelectElement.selectedOptions[0].dataset.cemeteryKey ?? '';
            cemeteryKeyFromSpanElement.innerHTML = cityssm.escapeHTML(cemeteryKey);
            cemeteryKeyToSpanElement.innerHTML = cityssm.escapeHTML(cemeteryKey);
        });
    }
})();
