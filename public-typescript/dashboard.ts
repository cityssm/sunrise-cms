// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */

import type * as globalTypes from '../types/globalTypes.js'

declare const exports: Record<string, unknown>
;(() => {
  const los = exports.los as globalTypes.LOS

  const workOrderNumberCircleElements: NodeListOf<HTMLElement> =
    document.querySelectorAll('.fa-circle[data-work-order-number]')

  for (const workOrderNumberCircleElement of workOrderNumberCircleElements) {
    workOrderNumberCircleElement.style.color = los.getRandomColor(
      workOrderNumberCircleElement.dataset.workOrderNumber ?? ''
    )
  }
})()
