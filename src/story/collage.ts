export type CollageLayer = {
  travel: number;
  depth: number;
  tilt: number;
  turn: number;
};

// Desktop lanes rise; phone lanes descend. Height is each lane's measured
// distance across the pinned window, so all twenty screens can be seen.
export const collageLayers: readonly CollageLayer[] = [
  { travel: -1, depth: 0, tilt: 0, turn: 0 },
  { travel: 1, depth: 0, tilt: 0, turn: 0 },
  { travel: -1, depth: 0, tilt: 0, turn: 0 },
  { travel: 1, depth: 0, tilt: 0, turn: 0 },
];

// The first and last poses align with the sticky interval. Scrolling backward
// follows the same path and exposes the same complete screens.
export function collageScrollRange(top: number, sectionHeight: number, viewportHeight: number, topInset: number) {
  return { start: top - topInset, distance: Math.max(1, sectionHeight - viewportHeight + topInset) };
}

export function collageProgress(scroll: number, start: number, distance: number) {
  if (distance <= 0) return 0.5;
  return Math.min(1, Math.max(0, (scroll - start) / distance));
}

export function sampleCollage(progress: number, layer: CollageLayer, height: number) {
  const offset = Math.min(1, Math.max(0, progress)) - 0.5;
  return {
    y: offset * layer.travel * height,
    z: layer.depth,
    rotateY: layer.turn,
    rotateZ: layer.tilt,
  };
}
