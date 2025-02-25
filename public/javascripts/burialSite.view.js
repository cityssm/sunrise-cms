"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const mapContainerElement = document.querySelector('#lot--map');
    if (mapContainerElement !== null) {
        ;
        exports.los.highlightMap(mapContainerElement, mapContainerElement.dataset.mapKey ?? '', 'success');
    }
})();
