import addOrUpdateBurialSiteField from './addOrUpdateBurialSiteField.js';
import deleteBurialSiteField from './deleteBurialSiteField.js';
export default function addOrUpdateBurialSiteFields(updateData, isNewBurialSite, user, database) {
    const burialSiteTypeFieldIds = (updateData.fieldForm.burialSiteTypeFieldIds ?? '').split(',');
    for (const burialSiteTypeFieldId of burialSiteTypeFieldIds) {
        const fieldValue = updateData.fieldForm[`fieldValue_${burialSiteTypeFieldId}`] ?? '';
        if (fieldValue === '') {
            if (!isNewBurialSite) {
                deleteBurialSiteField(updateData.burialSiteId, burialSiteTypeFieldId, user, database);
            }
        }
        else {
            addOrUpdateBurialSiteField({
                burialSiteId: updateData.burialSiteId,
                burialSiteTypeFieldId,
                fieldValue
            }, user, database);
        }
    }
}
