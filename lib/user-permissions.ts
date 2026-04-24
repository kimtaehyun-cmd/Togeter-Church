import type { User } from '@/lib/data';

export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'role' | 'createdAt'> & {
  togetherUploadStatus: NonNullable<User['togetherUploadStatus']>;
  togetherUploadRequestedAt?: string;
  togetherUploadReviewedAt?: string;
};

export function getTogetherUploadStatus(
  user: Pick<User, 'role' | 'togetherUploadStatus'> | null | undefined,
): NonNullable<User['togetherUploadStatus']> {
  if (!user) {
    return 'none';
  }

  if (user.role === 'admin') {
    return 'approved';
  }

  return user.togetherUploadStatus ?? 'none';
}

export function canUploadTogether(
  user: Pick<User, 'role' | 'togetherUploadStatus'> | null | undefined,
) {
  return getTogetherUploadStatus(user) === 'approved';
}

export function hasPendingTogetherUploadRequest(
  user: Pick<User, 'role' | 'togetherUploadStatus'> | null | undefined,
) {
  return getTogetherUploadStatus(user) === 'pending';
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    togetherUploadStatus: getTogetherUploadStatus(user),
    togetherUploadRequestedAt: user.togetherUploadRequestedAt,
    togetherUploadReviewedAt: user.togetherUploadReviewedAt,
  };
}
