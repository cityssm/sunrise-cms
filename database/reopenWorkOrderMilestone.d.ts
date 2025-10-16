import sqlite from 'better-sqlite3';
export default function reopenWorkOrderMilestone(workOrderMilestoneId: number | string, user: User, connectedDatabase?: sqlite.Database): boolean;
