export const DOC_TYPES = {
    CDL: 'cdl',
    MED_CARD: 'med_card',
    TRUCK_REGISTRATION: 'truck_registration',
    ANNUAL_INSPECTION: 'annual_inspection',
    INSURANCE: 'insurance',
    WORK_PERMIT_GREEN_CARD: 'work_permit_green_card'
};

export const DOC_LABELS = {
    cdl: 'CDL',
    med_card: 'Med Card',
    work_permit_green_card: 'Work Permit / Green Card',
    truck_registration: 'Truck Registration',
    annual_inspection: 'Annual Inspection',
    insurance: 'Insurance'
    
};

export const BASE_DOC_TYPES = [DOC_TYPES.CDL, DOC_TYPES.MED_CARD];

export const PREMIUM_DOC_TYPES = [
    DOC_TYPES.WORK_PERMIT_GREEN_CARD,
    DOC_TYPES.TRUCK_REGISTRATION,
    DOC_TYPES.ANNUAL_INSPECTION,
    DOC_TYPES.INSURANCE
    
];

export const ALL_DOC_TYPES = [...BASE_DOC_TYPES, ...PREMIUM_DOC_TYPES];

export const isPremiumDocType = (docType) =>
    PREMIUM_DOC_TYPES.includes(docType);
