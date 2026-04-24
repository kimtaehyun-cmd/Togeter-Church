import { type AdminActivityLogEntry, saveAdminActivityLogs, getAdminActivityLogs, type User } from '@/lib/data';

const MAX_ADMIN_ACTIVITY_LOGS = 500;

type LogAdminActivityInput = {
  actor: Pick<User, 'id' | 'name' | 'email'>;
  action: string;
  summary: string;
  targetType?: string;
  targetId?: string;
};

export function logAdminActivity({
  actor,
  action,
  summary,
  targetType = 'system',
  targetId = '',
}: LogAdminActivityInput) {
  const logs = getAdminActivityLogs();
  const nextEntry: AdminActivityLogEntry = {
    id: `admin-log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actorUserId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    action,
    summary,
    targetType,
    targetId,
    createdAt: new Date().toISOString(),
  };

  saveAdminActivityLogs([nextEntry, ...logs].slice(0, MAX_ADMIN_ACTIVITY_LOGS));
}
