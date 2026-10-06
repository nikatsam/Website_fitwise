import dispositionData from './route-dispositions.json';
import type { RouteDispositionRecord } from '../types';

/**
 * Release routing is deliberately separate from PageIntent.status, which is
 * transcribed from the source map and left unchanged. Published intent can be
 * generated or explicitly deferred; drafts never get a live path.
 */
export const routeDispositions = dispositionData as RouteDispositionRecord[];
