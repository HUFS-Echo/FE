import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/base.css';
import './styles/hero.css';
import './styles/globe.css';
import './styles/onboarding.css';
import './styles/workspace.css';
import './styles/student.css';
import './styles/portal.css';
import './styles/professor.css';
import './styles/profile.css';
import './styles/ivory-theme.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
