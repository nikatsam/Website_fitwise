import type { BlogWorkedExample } from '../../data/blog-posts';
import {
  buildBedRoomChecks,
  buildDoorSwingCheck,
  buildFitServicePlan,
  buildRugFitPlan,
  buildWorkspaceConfigurationCheck,
  buildWorkspaceDepthCheck,
  evaluateFitServicePlan,
} from '../geometry';
import {
  evaluateFit,
  getFitSummaryCopy,
  toDimensionDisplayRows,
  type DimensionCheck,
  type FitState,
  type MissingRequirement,
} from '../fit';

export function evaluateBlogWorkedExample(example: BlogWorkedExample) {
  let checks: DimensionCheck[];
  let assumptions: string[];
  let missingRequirements: MissingRequirement[] = [];
  let state: FitState;
  let result: ReturnType<typeof evaluateFit>;

  switch (example.calculator) {
    case 'rug': {
      const plan = buildRugFitPlan(example.values);
      checks = plan.checks;
      assumptions = [
        `Worked example selected ${plan.orientation} orientation.`,
        'All dimensions and border targets are illustrative user inputs, not product specifications or design standards.',
      ];
      result = evaluateFit(checks, assumptions);
      state = result.state;
      break;
    }
    case 'delivery-route':
    case 'appliance-install': {
      const plan = buildFitServicePlan(example.calculator, example.values);
      const evaluation = evaluateFitServicePlan(plan);
      checks = plan.checks;
      assumptions = plan.assumptions;
      missingRequirements = plan.missingRequirements ?? [];
      result = evaluation.result;
      state = evaluation.state;
      break;
    }
    case 'workspace': {
      const width = buildWorkspaceConfigurationCheck({
        widthsMm: Array.from(
          { length: example.values.monitorCount },
          () => example.values.monitorWidthMm,
        ),
        gapMm: example.values.gapMm,
        sideMarginRecommendedMm: example.values.sideMarginMm,
        deskWidthMm: example.values.deskWidthMm,
      });
      const depth = buildWorkspaceDepthCheck({
        monitorStandDepthMm: example.values.monitorStandDepthMm,
        rearClearanceMm: example.values.rearClearanceMm,
        keyboardZoneMm: example.values.keyboardZoneMm,
        deskDepthMm: example.values.deskDepthMm,
      });
      checks = [width.check, depth];
      assumptions = [
        'The same user-measured monitor outside width is applied to each screen.',
        'Keyboard, mouse, side and rear zones are user-selected inputs, not ergonomic recommendations.',
      ];
      result = evaluateFit(checks, assumptions);
      state = result.state;
      break;
    }
    case 'bedroom': {
      checks = buildBedRoomChecks(example.values.bedroom);
      if (example.values.wardrobeDoor) {
        checks.push(buildDoorSwingCheck(example.values.wardrobeDoor));
      }
      assumptions = [
        'Mattress, frame, nightstand and wardrobe-door dimensions are illustrative measurements.',
        'Side/foot clearances are user-selected targets, not universal room standards.',
      ];
      result = evaluateFit(checks, assumptions);
      state = result.state;
      break;
    }
  }

  const rows = toDimensionDisplayRows(checks, result);
  const summary = getFitSummaryCopy(state, rows, { missingRequirements });
  return { state, rows, result, summary, assumptions, missingRequirements };
}
