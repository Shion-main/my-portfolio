export type Triple = [number, number, number];
export interface Pose {
  progress: number;
  camera: Triple;
  target: Triple;
}
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (x: number) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
export const poses: Pose[] = [
  { progress: 0, camera: [-1.6, 3.6, 13], target: [0, 3.1, -4] },
  { progress: 22, camera: [2.2, 3.1, -0.6], target: [1.2, 2.8, -8] },
  { progress: 35, camera: [1, 3.2, -3], target: [3, 2.8, -10] },
  { progress: 50, camera: [6.5, 4.7, -12], target: [3, 1.8, -23] },
  { progress: 64, camera: [-1, 7, -15], target: [3, 0.5, -25] },
  { progress: 80, camera: [0, 3.7, -23], target: [3, 3.2, -33] },
  { progress: 100, camera: [17, 11, 2], target: [1, 2, -17] },
];
export function samplePose(
  progress: number,
  mobile = false,
): { camera: Triple; target: Triple } {
  const p = clamp(progress, 0, 100);
  let i = 0;
  while (i < poses.length - 2 && p > poses[i + 1].progress) i++;
  const a = poses[i],
    b = poses[i + 1];
  const t = smooth((p - a.progress) / (b.progress - a.progress));
  const lerp = (a: Triple, b: Triple): Triple =>
    a.map((v, j) => v + (b[j] - v) * t) as Triple;
  const camera = lerp(a.camera, b.camera),
    target = lerp(a.target, b.target);
  if (mobile) {
    // Portrait: keep the exhibit centered and shorten sideways travel.
    camera[0] = target[0] + (camera[0] - target[0]) * 0.28;
    camera[2] += 2.5 * smooth((p - 3) / 9) * (1 - smooth((p - 86) / 10));
    target[1] += 0.65 * (1 - smooth((p - 35) / 10));
  }
  return { camera, target };
}

export interface ScrollStop {
  y: number;
  end: number;
  progress: number;
}
export function progressAtScroll(y: number, stops: ScrollStop[]): number {
  if (!stops.length || y <= stops[0].y) return stops[0]?.progress ?? 0;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i],
      b = stops[i + 1];
    if (y <= a.end) return a.progress;
    if (y < b.y)
      return (
        a.progress +
        (b.progress - a.progress) *
          clamp((y - a.end) / Math.max(1, b.y - a.end))
      );
  }
  return stops[stops.length - 1].progress;
}
