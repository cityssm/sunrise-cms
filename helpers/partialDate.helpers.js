export function datePartsToInteger(year, month, day) {
    const yearNum = Number(year);
    if (!yearNum || yearNum <= 0) {
        return undefined;
    }
    const monthNum = Math.max(0, Math.min(12, Number(month) || 0));
    const dayNum = Math.max(0, Math.min(31, Number(day) || 0));
    return yearNum * 10_000 + monthNum * 100 + dayNum;
}
export function partialDateIntegerToString(dateInteger) {
    if (!dateInteger || dateInteger <= 0) {
        return '';
    }
    const dateStr = `00000000${dateInteger.toString()}`.slice(-8);
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    if (month === '00') {
        return year;
    }
    if (day === '00') {
        return `${year}-${month}`;
    }
    return `${year}-${month}-${day}`;
}
export function partialDateIntegerToYear(dateInteger) {
    if (!dateInteger || dateInteger <= 0) {
        return undefined;
    }
    return Math.floor(dateInteger / 10_000);
}
export function partialDateIntegerToMonth(dateInteger) {
    if (!dateInteger || dateInteger <= 0) {
        return 0;
    }
    return Math.floor((dateInteger % 10_000) / 100);
}
export function partialDateIntegerToDay(dateInteger) {
    if (!dateInteger || dateInteger <= 0) {
        return 0;
    }
    return dateInteger % 100;
}
