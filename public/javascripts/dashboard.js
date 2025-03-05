"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const workOrderNumberCircleElements = document.querySelectorAll('.fa-circle[data-work-order-number]');
    for (const workOrderNumberCircleElement of workOrderNumberCircleElements) {
        workOrderNumberCircleElement.style.color = sunrise.getRandomColor(workOrderNumberCircleElement.dataset.workOrderNumber ?? '');
    }
})();
