import { resetDemoState } from '../lib/demoStore';

/** Mock-only development utility. This does not map to a production API endpoint. */
export function resetDemoData() {
  return resetDemoState();
}
