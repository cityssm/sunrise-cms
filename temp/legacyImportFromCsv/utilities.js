/* eslint-disable @typescript-eslint/no-magic-numbers */
export const user = {
    userName: 'import.unix',
    userProperties: {
        canUpdateCemeteries: true,
        canUpdateContracts: true,
        canUpdateWorkOrders: true,
        isAdmin: false
    },
    userSettings: {}
};
export function formatDateString(year, month, day) {
    let formattedYear = `0000${year}`.slice(-4);
    if (formattedYear === '3014') {
        formattedYear = '2014';
    }
    else if (formattedYear === '2202') {
        formattedYear = '2022';
    }
    const formattedMonth = `00${month}`.slice(-2);
    const formattedDay = `00${day}`.slice(-2);
    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
}
export function formatTimeString(hour, minute) {
    const formattedHour = `00${hour}`.slice(-2);
    const formattedMinute = `00${minute}`.slice(-2);
    return `${formattedHour}:${formattedMinute}`;
}
export function formatContractNumber(orderNumber) {
    const trimmedOrderNumber = orderNumber.trim();
    if (trimmedOrderNumber === '') {
        return undefined;
    }
    return `UNIX-${trimmedOrderNumber}`;
}
