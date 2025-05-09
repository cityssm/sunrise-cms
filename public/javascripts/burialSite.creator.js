"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
(() => {
    const sunrise = exports.sunrise;
    const newResultsCountElement = document.querySelector('#burialSitePreview_newCount');
    const newResultsContainerElement = document.querySelector('#container--burialSitePreview_new');
    const existingResultsCountElement = document.querySelector('#burialSitePreview_existingCount');
    const existingResultsContainerElement = document.querySelector('#container--burialSitePreview_existing');
    function renderBurialSiteNames(responseJSON) { }
    document
        .querySelector('#form--burialSiteCreator')
        ?.addEventListener('submit', (event) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        document.querySelector('#tab--burialSitePreview').click();
        newResultsCountElement.innerHTML = '0';
        // eslint-disable-next-line no-unsanitized/property
        newResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHTML('Building burial sites...');
        existingResultsCountElement.innerHTML = '0';
        existingResultsContainerElement.innerHTML = '';
        cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doGetBurialSiteNamesByRange`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            renderBurialSiteNames(responseJSON);
        });
    });
})();
