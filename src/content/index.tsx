// index.tsx 또는 main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import styles from '@/styles/shadow.css?inline';
import { createShadowRoot } from '@/lib/createShadowRoot';
import { ShadowRootContext } from '@/lib/ShadowRootContext';
import { TooltipProvider } from '@/components/ui/tooltip';

const body = document.querySelector('#div_print_area');

if (body) {
  const host = document.createElement('div');
  host.id = 'extension-content-root';
  host.style.position = 'relative';
  body.prepend(host);

  const shadowRoot = createShadowRoot(host, [styles]);

  // Shadow DOM 내에 모달용 div 추가
  const modalContainer = document.createElement('div');
  modalContainer.id = 'shadow-modal-root';
  shadowRoot.appendChild(modalContainer);

  createRoot(shadowRoot).render(
    <ShadowRootContext.Provider value={shadowRoot}>
      <React.StrictMode>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </React.StrictMode>
    </ShadowRootContext.Provider>
  );
}
