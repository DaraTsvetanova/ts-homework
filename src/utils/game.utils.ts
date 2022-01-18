// Add utility functions here to avoid poluting app.component.ts

import { Position } from 'src/models/models';

export function areCoordinatesValid(coordinates: any) {
  const reg = /^((?!-0)-?[0-9]+)+,((?!-0)-?[0-9]+)+$/;
  return reg.test(coordinates);
}
