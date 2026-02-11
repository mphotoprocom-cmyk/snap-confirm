import { useState, useEffect, useCallback, useRef } from 'react';

const PAGE_SIZE = 60;

/**
 * Provides infinite-scroll pagination for a list of images.
 * Returns a subset that grows as the user scrolls down.
 */
export function useInfiniteGallery<T>(allItems: T[], pageSize = PAGE_SIZE) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const visibleItems = allItems.slice(0, visibleCount);
  const hasMore = visibleCount < allItems.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + pageSize, allItems.length));
  }, [allItems.length, pageSize]);

  // Reset when items change (e.g. sorting or face search)
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [allItems.length, pageSize]);

  // IntersectionObserver on the sentinel element
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          loadMore();
        }
      },
      { rootMargin: '400px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return { visibleItems, hasMore, sentinelRef, visibleCount, totalCount: allItems.length };
}
