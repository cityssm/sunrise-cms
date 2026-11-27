export const currentUserVersion = 4;
export function getCurrentUserVersion(database) {
    const row = database.prepare('PRAGMA user_version').get();
    return row?.user_version ?? 0;
}
export function hasTableColumn(database, tableName, columnName) {
    const columns = database
        .prepare(`PRAGMA table_info(${tableName})`)
        .all();
    return columns.some((column) => column.name === columnName);
}
