import { describe, expect, it } from 'vitest';
import { BLOG_POSTS } from '../../src/data/blog-posts';
import { evaluateBlogWorkedExample } from '../../src/lib/blog/worked-example';

const postsBySlug = new Map(BLOG_POSTS.map((post) => [post.slug, post]));

describe('blog worked examples', () => {
  it('reproduces the rug example as a room and full-footprint fit', () => {
    const post = postsBySlug.get('rug-fit-in-a-room')!;
    const result = evaluateBlogWorkedExample(post.workedExample);

    expect(result.state).toBe('fits');
    expect(result.rows.map((row) => row.dimension)).toEqual([
      'rug_room_width',
      'rug_room_depth',
      'rug_furniture_width',
      'rug_furniture_depth',
    ]);
    expect(result.rows[2]?.recommendedMm).toBe(2300);
    expect(result.rows[2]?.availableMm).toBe(2500);
  });

  it('reproduces the sofa route example and identifies its conservative turn-width failure', () => {
    const post = postsBySlug.get('sofa-through-a-doorway')!;
    const result = evaluateBlogWorkedExample(post.workedExample);
    const turnWidth = result.rows.find((row) => row.dimension === 'turn_width');

    expect(result.state).toBe('does_not_fit');
    expect(turnWidth?.hardFit).toBe(false);
    expect(turnWidth?.availableMm).toBe(1200);
    expect(turnWidth?.requiredMm).toBeGreaterThan(1200);
  });

  it('reproduces the dual-monitor example with positive width and depth margins', () => {
    const post = postsBySlug.get('two-monitors-one-desk')!;
    const result = evaluateBlogWorkedExample(post.workedExample);
    const width = result.rows.find((row) => row.dimension === 'width');
    const depth = result.rows.find((row) => row.dimension === 'desk_depth');

    expect(result.state).toBe('fits');
    expect(width?.requiredMm).toBe(1270);
    expect(width?.recommendedMm).toBe(1370);
    expect(width?.availableMm).toBe(1400);
    expect(depth?.requiredMm).toBe(300);
    expect(depth?.recommendedMm).toBe(600);
    expect(depth?.availableMm).toBe(700);
  });

  it('reproduces the bed/wardrobe example including the door swing', () => {
    const post = postsBySlug.get('bed-and-wardrobe-clearance')!;
    const result = evaluateBlogWorkedExample(post.workedExample);
    const doorSwing = result.rows.find((row) => row.dimension === 'wardrobe_door_sweep');

    expect(result.state).toBe('fits');
    expect(doorSwing?.requiredMm).toBe(600);
    expect(doorSwing?.availableMm).toBe(700);
  });

  it('reproduces the fridge example as Needs information when the model manual is unknown', () => {
    const post = postsBySlug.get('fridge-opening-vs-delivery-route')!;
    const result = evaluateBlogWorkedExample(post.workedExample);

    expect(result.state).toBe('needs_information');
    expect(result.summary.resultLabel).toBe('Needs information');
    expect(result.missingRequirements.map((item) => item.label)).toContain(
      'Installation clearance source',
    );
  });
});
