export const user = {
    userName: 'import.unix',
    userProperties: {
        canUpdate: true,
        canUpdateWorkOrders: true,
        isAdmin: false
    },
    userSettings: {}
};
export function formatDateString(year, month, day) {
    const formattedYear = `0000${year}`.slice(-4);
    const formattedMonth = `00${month}`.slice(-2);
    const formattedDay = `00${day}`.slice(-2);
    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
}
export function formatTimeString(hour, minute) {
    const formattedHour = `00${hour}`.slice(-2);
    const formattedMinute = `00${minute}`.slice(-2);
    return `${formattedHour}:${formattedMinute}`;
}
