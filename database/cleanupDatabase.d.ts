export default function cleanupDatabase(user: User): {
    inactivatedRecordCount: number;
    purgedRecordCount: number;
};
