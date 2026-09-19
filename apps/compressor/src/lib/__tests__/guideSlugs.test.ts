import { describe, it, expect } from 'bun:test';
import { GUIDE_SLUGS, isGuideSlug } from '../../data/guideSlugs';
import { guidesData } from '../../data/guides';

describe('Guide slug index', () => {
  it('stays in sync with guidesData', () => {
    const fromData = guidesData.map((g) => g.slug).sort();
    const fromIndex = [...GUIDE_SLUGS].sort();
    expect(fromIndex).toEqual(fromData);
  });

  it('exposes no duplicate slugs', () => {
    expect(new Set(GUIDE_SLUGS).size).toBe(GUIDE_SLUGS.length);
  });

  it('isGuideSlug resolves every real guide and rejects unknown slugs', () => {
    for (const slug of GUIDE_SLUGS) {
      expect(isGuideSlug(slug)).toBe(true);
    }
    expect(isGuideSlug('definitely-not-a-guide')).toBe(false);
    expect(isGuideSlug('')).toBe(false);
  });
});
