import * as THREE from 'three';

export const DEG = Math.PI / 180;

/**
 * 위경도 → 구면 좌표.
 * lon 0, lat 0이 +Z(카메라 정면)에 오도록 정의합니다.
 */
export function latLonToVector3(lat: number, lon: number, radius = 1): THREE.Vector3 {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  return new THREE.Vector3(
    Math.cos(phi) * Math.sin(lambda) * radius,
    Math.sin(phi) * radius,
    Math.cos(phi) * Math.cos(lambda) * radius,
  );
}

export type LatLon = { lat: number; lon: number };

/**
 * 서울 → 목적지로 솟아오르는 포물선.
 * 두 점의 중간 방향을 바깥으로 밀어 제어점을 만듭니다.
 */
export function buildArcCurve(from: LatLon, to: LatLon, lift: number): THREE.QuadraticBezierCurve3 {
  const a = latLonToVector3(from.lat, from.lon);
  const b = latLonToVector3(to.lat, to.lon);
  const mid = a.clone().add(b).normalize();
  const angle = a.angleTo(b);
  const height = 1 + lift * (0.55 + angle / Math.PI);
  const control = mid.multiplyScalar(height);
  return new THREE.QuadraticBezierCurve3(a, control, b);
}

export function easeOutCubic(value: number): number {
  const t = Math.min(1, Math.max(0, value));
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutCubic(value: number): number {
  const t = Math.min(1, Math.max(0, value));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
