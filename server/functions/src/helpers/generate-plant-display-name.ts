import { Plant } from '../types';

export function generatePlantDisplayName(document: Plant): string {
  const { commonName = '', variety = '' } = document || {};
  return `${commonName}, ${variety}`;
}
