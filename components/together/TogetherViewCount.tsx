'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

type TogetherViewCountProps = {
  postId: string;
  initialViews: number;
};

const VIEW_COUNT_STORAGE_PREFIX = 'together:viewed:';
const VIEW_COUNT_TTL_MS = 12 * 60 * 60 * 1000;

function getStorageKey(postId: string) {
  return `${VIEW_COUNT_STORAGE_PREFIX}${postId}`;
}

export default function TogetherViewCount({
  postId,
  initialViews,
}: TogetherViewCountProps) {
  const [viewState, setViewState] = useState({ postId, views: initialViews });
  const views = viewState.postId === postId ? viewState.views : initialViews;

  useEffect(() => {
    const storageKey = getStorageKey(postId);
    const now = Date.now();

    try {
      const storedViewedAt = window.localStorage.getItem(storageKey);

      if (storedViewedAt) {
        const viewedAt = Number(storedViewedAt);

        if (Number.isFinite(viewedAt) && now - viewedAt < VIEW_COUNT_TTL_MS) {
          return;
        }
      }
    } catch {
      // Ignore storage access errors and continue with best-effort tracking.
    }

    let cancelled = false;

    void fetch(`/api/together/${encodeURIComponent(postId)}/view`, {
      method: 'POST',
      cache: 'no-store',
    })
      .then(async response => {
        if (!response.ok) {
          return null;
        }

        const result = (await response.json()) as { views?: number };

        try {
          window.localStorage.setItem(storageKey, String(now));
        } catch {
          // Ignore storage write failures.
        }

        if (!cancelled && typeof result.views === 'number') {
          setViewState({ postId, views: result.views });
        }

        return null;
      })
      .catch(() => null);

    return () => {
      cancelled = true;
    };
  }, [initialViews, postId]);

  return (
    <div className="flex items-center gap-2">
      <Eye size={18} className="text-[#94A3B8]" />
      <span>{views}</span>
    </div>
  );
}
