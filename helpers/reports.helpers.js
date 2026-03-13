export const simpleReports = new Map([
    [
        'burialSiteComments-all',
        /* sql */ `
      SELECT
        *
      FROM
        BurialSiteComments
    `
    ],
    [
        'burialSiteFields-all',
        /* sql */ `
      SELECT
        *
      FROM
        BurialSiteFields
    `
    ],
    [
        'burialSites-all',
        /* sql */ `
      SELECT
        *
      FROM
        BurialSites
    `
    ],
    [
        'burialSiteStatuses-all',
        /* sql */ `
      SELECT
        *
      FROM
        BurialSiteStatuses
    `
    ],
    [
        'burialSiteTypeFields-all',
        /* sql */ `
      SELECT
        *
      FROM
        BurialSiteTypeFields
    `
    ],
    [
        'burialSiteTypes-all',
        /* sql */ `
      SELECT
        *
      FROM
        BurialSiteTypes
    `
    ],
    [
        'cemeteries-all',
        /* sql */ `
      SELECT
        *
      FROM
        Cemeteries
    `
    ],
    [
        'cemeteries-formatted',
        /* sql */ `
      SELECT
        cemeteryName,
        cemeteryDescription,
        cemeteryAddress1,
        cemeteryAddress2,
        cemeteryCity,
        cemeteryProvince,
        cemeteryPostalCode,
        cemeteryPhoneNumber
      FROM
        Cemeteries
      WHERE
        recordDelete_timeMillis IS NULL
      ORDER BY
        cemeteryName
    `
    ],
    [
        'committalTypes-all',
        /* sql */ `
      SELECT
        *
      FROM
        CommittalTypes
    `
    ],
    [
        'contractAttachments-all',
        /* sql */ `
      SELECT
        *
      FROM
        ContractAttachments
    `
    ],
    [
        'contractComments-all',
        /* sql */ `
      SELECT
        *
      FROM
        ContractComments
    `
    ],
    [
        'contractFees-all',
        /* sql */ `
      SELECT
        *
      FROM
        ContractFees
    `
    ],
    [
        'contractFields-all',
        /* sql */ `
      SELECT
        *
      FROM
        ContractFields
    `
    ],
    [
        'contractInterments-all',
        /* sql */ `
      SELECT
        *
      FROM
        ContractInterments
    `
    ],
    [
        'contractMetadata-all',
        /* sql */ `
      SELECT
        *
      FROM
        ContractMetadata
    `
    ],
    [
        'contracts-all',
        /* sql */ `
      SELECT
        *
      FROM
        Contracts
    `
    ],
    [
        'contractServiceTypes-all',
        /* sql */ `
      SELECT
        *
      FROM
        ContractServiceTypes
    `
    ],
    [
        'contractTransactions-all',
        /* sql */ `
      SELECT
        *
      FROM
        ContractTransactions
    `
    ],
    [
        'contractTypeFields-all',
        /* sql */ `
      SELECT
        *
      FROM
        ContractTypeFields
    `
    ],
    [
        'contractTypePrints-all',
        /* sql */ `
      SELECT
        *
      FROM
        ContractTypePrints
    `
    ],
    [
        'contractTypes-all',
        /* sql */ `
      SELECT
        *
      FROM
        ContractTypes
    `
    ],
    [
        'feeCategories-all',
        /* sql */ `
      SELECT
        *
      FROM
        FeeCategories
    `
    ],
    [
        'fees-all',
        /* sql */ `
      SELECT
        *
      FROM
        Fees
    `
    ],
    [
        'funeralHomes-all',
        /* sql */ `
      SELECT
        *
      FROM
        FuneralHomes
    `
    ],
    [
        'funeralHomes-formatted',
        /* sql */ `
      SELECT
        funeralHomeName,
        funeralHomeAddress1,
        funeralHomeAddress2,
        funeralHomeCity,
        funeralHomeProvince,
        funeralHomePostalCode,
        funeralHomePhoneNumber
      FROM
        FuneralHomes
      WHERE
        recordDelete_timeMillis IS NULL
    `
    ],
    [
        'intermentContainerTypes-all',
        /* sql */ `
      SELECT
        *
      FROM
        IntermentContainerTypes
    `
    ],
    [
        'intermentDepths-all',
        /* sql */ `
      SELECT
        *
      FROM
        IntermentDepths
    `
    ],
    [
        'serviceTypes-all',
        /* sql */ `
      SELECT
        *
      FROM
        ServiceTypes
    `
    ],
    [
        'workOrderBurialSites-all',
        /* sql */ `
      SELECT
        *
      FROM
        WorkOrderBurialSites
    `
    ],
    [
        'workOrderComments-all',
        /* sql */ `
      SELECT
        *
      FROM
        WorkOrderComments
    `
    ],
    [
        'workOrderMilestones-all',
        /* sql */ `
      SELECT
        *
      FROM
        WorkOrderMilestones
    `
    ],
    [
        'workOrderMilestoneTypes-all',
        /* sql */ `
      SELECT
        *
      FROM
        WorkOrderMilestoneTypes
    `
    ],
    [
        'workOrders-all',
        /* sql */ `
      SELECT
        *
      FROM
        WorkOrders
    `
    ],
    [
        'workOrderTypes-all',
        /* sql */ `
      SELECT
        *
      FROM
        WorkOrderTypes
    `
    ]
]);
