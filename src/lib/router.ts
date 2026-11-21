import type { Role } from './session';

export function roleHome(role: Role) { return role === 'student' ? '/student' : '/prof'; }

export function roleForPath(path: string): Role | null {
  if (path === '/student' || path.startsWith('/student/')) return 'student';
  if (path === '/prof' || path.startsWith('/prof/')) return 'professor';
  return null;
}

export function navigateTo(path: string) {
  if (window.location.pathname !== path) window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
