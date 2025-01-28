import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import styles from '@/styles/shadow.css?inline';
import { createShadowRoot } from '@/lib/createShadowRoot';
import { ShadowRootContext } from '@/lib/ShadowRootContext';
import { TooltipProvider } from '@/components/ui/tooltip';

const body = document.querySelector('#div_print_area > div');
const row = document.querySelector('#div_print_area > div > div.title');

if (body && row) {
  // 토글 버튼 생성
  const toggleButton = document.createElement('button');
  toggleButton.id = 'my-toggle-button';
  toggleButton.innerText = 'Toggle Elements';

  // 버튼 스타일 설정
  toggleButton.style.padding = '10px 20px';
  toggleButton.style.backgroundColor = '#007bff';
  toggleButton.style.color = '#fff';
  toggleButton.style.border = 'none';
  toggleButton.style.borderRadius = '5px';
  toggleButton.style.cursor = 'pointer';
  toggleButton.style.marginLeft = '10px';

  row.appendChild(toggleButton);

  // 확장 프로그램의 호스트 요소 생성
  const host = document.createElement('div');
  host.id = 'extension-content-root';
  host.style.position = 'relative';
  host.style.display = 'none'; // 초기에는 숨김
  body.appendChild(host);

  // Shadow DOM 생성 및 스타일 적용
  const shadowRoot = createShadowRoot(host, [styles]);

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

  // 토글 버튼 클릭 시 동작 로직
  toggleButton.addEventListener('click', () => {
    const targetElement = document.querySelector('#div_print_area > div > div._obj._objHtml._absolute') as HTMLElement;
    const targetElementTitle = document.querySelector('#div_print_area > div > div.title') as HTMLElement;
    const hostElement = host as HTMLElement;

    if (targetElement && hostElement) {
      toggleButton.addEventListener('click', () => {
        const isHidden = targetElement.style.display === 'none';
        targetElement.style.display = isHidden ? 'block' : 'none';
        targetElementTitle.style.display = isHidden ? 'block' : 'none';
        hostElement.style.display = isHidden ? 'none' : 'block';
        toggleButton.innerText = isHidden ? 'Toggle Elements' : 'Show Original';
        toggleButton.setAttribute('aria-pressed', isHidden ? 'false' : 'true');
      });
    }
  });
}
