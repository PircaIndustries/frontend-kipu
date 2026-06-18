/**
 * Map of MeasureUnit numeric values to human-readable labels (Spanish).
 * Backend sends int, frontend displays the label.
 */
export const MEASURE_UNIT_LABELS = {
  1:  'und',
  2:  'pz',
  11: 't',
  20: 'm',
  21: 'ml',
  30: 'm2',
  40: 'm3',
  41: 'l',
  42: 'gal',
  50: 'bolsa',
  51: 'rollo',
  52: 'varilla',
  53: 'plancha',
  54: 'balde',
  55: 'caja',
};

export function getMeasureUnitLabel(value) {
  return MEASURE_UNIT_LABELS[value] ?? String(value);
}
