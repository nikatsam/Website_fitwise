export {
  evaluateFit,
  type FitState,
  type DimensionCheck,
  type DimensionResult,
  type FitResult,
} from './engine';
export {
  toDimensionDisplayRows,
  selectSummaryDimension,
  getFailedDimensionRows,
  type DimensionDisplayRow,
} from './display';
export { FIT_STATE_BADGE_COPY, type FitStateBadgeCopy } from './copy';
export {
  getFitSummaryCopy,
  getFitSummaryResultLabel,
  renderFitSummaryContentHtml,
  type CompatibilitySummaryCheck,
  type FitSummaryCopy,
} from './summary-copy';
export { buildFitReviewReport, type FitReviewReportInput } from './copy-report';
