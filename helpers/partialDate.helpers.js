export function datePartsToInteger(year, month, day) {
    const yearNumber = Number(year);
    if (!yearNumber || yearNumber <= 0) {
        return undefined;
    }
    const monthNumber = Math.max(0, Math.min(12, Number(month) || 0));
    const dayNumber = Math.max(0, Math.min(31, Number(day) || 0));
    return yearNumber * 10_000 + monthNumber * 100 + dayNumber;
}
export function partialDateIntegerToString(dateInteger) {
    if (!dateInteger || dateInteger <= 0) {
        return '';
    }
    const dateString = `00000000${dateInteger.toString()}`.slice(-8);
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    if (month === '00') {
        return year;
    }
    const day = dateString.slice(6, 8);
    return day === '00' ? `${year}-${month}` : `${year}-${month}-${day}`;
}
export function partialDateIntegerToYear(dateInteger) {
    return !dateInteger || dateInteger <= 0
        ? undefined
        : Math.floor(dateInteger / 10_000);
}
export function partialDateIntegerToMonth(dateInteger) {
    return !dateInteger || dateInteger <= 0
        ? 0
        : Math.floor((dateInteger % 10_000) / 100);
}
export function partialDateIntegerToDay(dateInteger) {
    return !dateInteger || dateInteger <= 0 ? 0 : dateInteger % 100;
}
