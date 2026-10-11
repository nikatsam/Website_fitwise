export type MissingRequirementType =
  'manual_reference' | 'manufacturer_source' | 'compatibility_data' | 'safety_use_zone';

export interface MissingRequirement {
  type: MissingRequirementType;
  label: string;
  explanation: string;
  action: string;
}
