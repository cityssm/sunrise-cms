export function getDeathAgePeriod(legacyDeathAgePeriod: string): string {
  switch (legacyDeathAgePeriod.toLowerCase()) {
    case 'yrs': {
      return 'Years'
    }
    case 'mts': {
      return 'Months'
    }
    case 'dys': {
      return 'Days'
    }

    default: {
      return legacyDeathAgePeriod
    }
  }
}
