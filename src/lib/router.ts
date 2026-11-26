import type { Role } from './session';

export function roleHome(role: Role) { return role === 'STUDENT' ? '/student' : '/prof'; }

export function roleForPath(path: string): Role | null {
  if (path === '/student' || path.startsWith('/student/')) return 'STUDENT';
  if (path === '/prof' || path.startsWith('/prof/')) return 'PROFESSOR';
  return null;
}

export function navigateTo(path: string) {
  if (window.location.pathname !== path) window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
