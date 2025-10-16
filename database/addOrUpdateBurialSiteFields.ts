import type sqlite from 'better-sqlite3'

import addOrUpdateBurialSiteField from './addOrUpdateBurialSiteField.js'
import deleteBurialSiteField from './deleteBurialSiteField.js'

export interface BurialSiteFieldsForm {
  burialSiteTypeFieldIds?: string

  [fieldValue_burialSiteTypeFieldId: `fieldValue_${number}`]: unknown
}

export default function addOrUpdateBurialSiteFields(
  updateData: {
    burialSiteId: number | string
    fieldForm: BurialSiteFieldsForm
  },
  isNewBurialSite: boolean,
  user: User,
  database: sqlite.Database
): void {
  const burialSiteTypeFieldIds = (
    updateData.fieldForm.burialSiteTypeFieldIds ?? ''
  ).split(',')

  for (const burialSiteTypeFieldId of burialSiteTypeFieldIds) {
    const fieldValue =
      (updateData.fieldForm[`fieldValue_${burialSiteTypeFieldId}`] as
        | string
        | undefined) ?? ''

    if (fieldValue === '') {
      if (!isNewBurialSite) {
        deleteBurialSiteField(
          updateData.burialSiteId,
          burialSiteTypeFieldId,
          user,
          database
        )
      }
    } else {
      addOrUpdateBurialSiteField(
        {
          burialSiteId: updateData.burialSiteId,
          burialSiteTypeFieldId,
          fieldValue
        },
        user,
        database
      )
    }
  }
}
