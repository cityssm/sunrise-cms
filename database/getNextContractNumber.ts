import { type SQLOutputValue, DatabaseSync } from 'node:sqlite'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

// eslint-disable-next-line require-unicode-regexp
const contractNumberRegex = /^\d+$/

function matchesContractNumberSyntax(contractNumber: SQLOutputValue): 0 | 1 {
  return contractNumberRegex.test(contractNumber as string) ? 1 : 0
}

export default function getNextContractNumber(
  connectedDatabase?: DatabaseSync
): string {
  const database =
    connectedDatabase ?? new DatabaseSync(sunriseDB, { readOnly: true })

  const paddingLength = getConfigProperty(
    'settings.contracts.contractNumberLength'
  )

  const currentYear = new Date().getFullYear()
  const currentYearString = currentYear.toString()

  database.function(
    'userFn_matchesContractNumberSyntax',
    {
      deterministic: true
    },
    matchesContractNumberSyntax
  )

  const contractNumberRecord = database
    .prepare(/* sql */ `
      SELECT
        contractNumber
      FROM
        Contracts
      WHERE
        contractNumber like ? || '%'
        AND userFn_matchesContractNumberSyntax (contractNumber) = 1
        AND LENGTH(contractNumber) = ?
      ORDER BY
        CAST(contractNumber AS INTEGER) DESC
      LIMIT
        1
    `)
    .get(currentYearString, paddingLength) as
    | {
        contractNumber: string
      }
    | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  let contractNumber = `${currentYearString.padEnd(paddingLength - 1, '0')}1`

  if (contractNumberRecord !== undefined) {
    contractNumber = (
      Math.trunc(Number(contractNumberRecord.contractNumber)) + 1
    )
      .toString()
      .padStart(paddingLength, '0')
  }

  return contractNumber
}
