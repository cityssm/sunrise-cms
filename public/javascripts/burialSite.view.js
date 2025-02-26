"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const mapContainerElement = document.querySelector('#burialSite--cemeterySvg');
    if (mapContainerElement !== null) {
        ;
        exports.los.highlightMap(mapContainerElement, mapContainerElement.dataset.cemeterySvgId ?? '', 'success');
    }
})();
