"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const los = exports.sunrise;
    const workOrderNumberCircleElements = document.querySelectorAll('.fa-circle[data-work-order-number]');
    for (const workOrderNumberCircleElement of workOrderNumberCircleElements) {
        workOrderNumberCircleElement.style.color = los.getRandomColor(workOrderNumberCircleElement.dataset.workOrderNumber ?? '');
    }
})();
