import type { Request, Response } from 'express'

import getOrderForm, {
  getOrderFormMismatches
} from '../../database/getOrderForm.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { i18next } from '../../helpers/i18n.helpers.js'
import { canUserUpdateContracts } from '../../helpers/user.helpers.js'

export default function handler(
  request: Request<
    { orderFormId: string },
    unknown,
    unknown,
    { actions?: string; modal?: string }
  >,
  response: Response
): void {
  const orderForm = getOrderForm(request.params.orderFormId)

  if (orderForm === undefined) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/contracts/orderForms/?error=orderFormNotFound`
    )
    return
  }

  const canUpdateContracts = canUserUpdateContracts(request)
  const shouldShowModal = request.query.modal === 'true'
  const shouldShowActions = request.query.actions !== 'false'

  response.render(shouldShowModal ? 'contracts/orderFormModal' : 'contracts/orderForm', {
    headTitle: i18next.t('contracts.orderFormTitle', {
      id: orderForm.orderFormId,
      lng: response.locals.lng
    }),

    canUpdateContracts,
    mismatches: getOrderFormMismatches(orderForm),
    orderForm,
    showActions: shouldShowActions
  })
}
