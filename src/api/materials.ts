import { mockRequest, fail } from './client';
import type { Material } from './types';
let materials: Material[] = [
  { materialId: 1, fileName: 'Português_A1_2026.pdf', pageCount: 120, usedScopeCount: 3, fileUrl: '/mock/materials/1.pdf', uploadedAt: '2026-11-17T09:00:00', lastUsedAt: '2026-11-23T10:00:00' },
  { materialId: 2, fileName: 'Caderno_gramática.pdf', pageCount: 84, usedScopeCount: 1, fileUrl: '/mock/materials/2.pdf', uploadedAt: '2026-11-17T09:00:00' },
  { materialId: 3, fileName: 'Diálogos_A1.pdf', pageCount: 56, usedScopeCount: 0, fileUrl: '/mock/materials/3.pdf', uploadedAt: '2026-11-17T09:00:00' },
];
/** A16 POST /prof/materials — Bearer(교수만), multipart/form-data mock */
export function uploadMaterial(file: File) { return mockRequest('A16', () => { if (!file.name.toLowerCase().endsWith('.pdf')) fail(400, 'INVALID_FILE', 'PDF 파일만 올릴 수 있어요.'); const material = { materialId: Date.now(), fileName: file.name, pageCount: 56 }; materials = [material, ...materials]; return material; }, '강의자료를 올렸어요.'); }
/** A17 GET /prof/materials — Bearer(교수만) */
export function getMaterials() { return mockRequest<{ materials: Material[] }>('A17', () => ({ materials })); }
/** A18 DELETE /prof/materials/{materialId} — Bearer(교수만) */
export function deleteMaterial(materialId: number) { return mockRequest<null>('A18', () => { const target = materials.find((item) => item.materialId === materialId); if (target?.usedScopeCount) fail(409, 'MATERIAL_IN_USE', `학습 범위 ${target.usedScopeCount}개에서 사용 중인 자료예요.`); materials = materials.filter((item) => item.materialId !== materialId); return null; }, '강의자료를 삭제했어요.'); }
