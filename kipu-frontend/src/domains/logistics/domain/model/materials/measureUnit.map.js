/**
 * Map of MeasureUnit numeric values to human-readable labels (Spanish).
 * Backend sends enum name strings (JsonStringEnumConverter), frontend maps both ways.
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

export const MEASURE_UNIT_NAME_TO_VALUE = {
  'Unit': 1,
  'Piece': 2,
  'Ton': 11,
  'Meter': 20,
  'LinearMeter': 21,
  'SquareMeter': 30,
  'CubicMeter': 40,
  'Liter': 41,
  'Gallon': 42,
  'Bag': 50,
  'Roll': 51,
  'Rod': 52,
  'Sheet': 53,
  'Bucket': 54,
  'Box': 55,
};

export function getMeasureUnitLabel(value) {
  if (value == null) return '---';
  if (typeof value === 'number') return MEASURE_UNIT_LABELS[value] ?? String(value);
  if (typeof value === 'string') {
    const num = parseInt(value, 10);
    if (!isNaN(num)) return MEASURE_UNIT_LABELS[num] ?? value;
    return MEASURE_UNIT_LABELS[MEASURE_UNIT_NAME_TO_VALUE[value]] ?? value;
  }
  return String(value);
}

export function getMeasureUnitValue(value) {
  if (value == null) return null;
  if (typeof value === 'number') return value;
  const num = parseInt(value, 10);
  if (!isNaN(num)) return num;
  return MEASURE_UNIT_NAME_TO_VALUE[value] ?? null;
}
