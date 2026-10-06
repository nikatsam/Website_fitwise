import type { PageStatus } from './page-intent';

export type RouteDispositionRecord =
  | {
      pageIntentId: string;
      route: string;
      intentStatus: 'published';
      disposition: 'generated';
      renderer: 'family' | 'static';
    }
  | {
      pageIntentId: string;
      route: string;
      intentStatus: 'published';
      disposition: 'deferred';
      reason: string;
    }
  | {
      pageIntentId: string;
      route: string;
      intentStatus: 'draft';
      disposition: 'draft';
    }
  | {
      pageIntentId: string;
      route: string;
      intentStatus: 'deferred';
      disposition: 'deferred';
      reason: string;
    };

export function isMatchingStatus(disposition: RouteDispositionRecord, status: PageStatus): boolean {
  return disposition.intentStatus === status;
}
