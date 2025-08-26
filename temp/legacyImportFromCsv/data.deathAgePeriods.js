export function getDeathAgePeriod(legacyDeathAgePeriod) {
    switch (legacyDeathAgePeriod.toLowerCase()) {
        case 'dys': {
            return 'Days';
        }
        case 'mts': {
            return 'Months';
        }
        case 'yrs': {
            return 'Years';
        }
        default: {
            return legacyDeathAgePeriod;
        }
    }
}
