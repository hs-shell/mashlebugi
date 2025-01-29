import React from 'react';
import { createRoot } from 'react-dom/client';
import SubjectApp from './subject/SubjectApp';
import styles from '@/styles/shadow.css?inline';
import { createShadowRoot } from '@/lib/createShadowRoot';
import { ShadowRootContext } from '@/lib/ShadowRootContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { saveDataToStorage, loadDataFromStorage } from '@/hooks/storage';
import SugangApp from './suganginwon/SugangInwonApp';

const href = window.location.href;

if (href.includes('siganpyo_aui.jsp') || href.includes('h_sugang_inwon_s01_new_aui.jsp')) {
  const body = document.querySelector('#div_print_area > div') as HTMLElement | null;
  const row = document.querySelector('#div_print_area > div > div.title') as HTMLElement | null;
  const departmentElement = document.querySelector(
    '#aside_id > div > div.os-padding > div > div > div > div.info > a'
  ) as HTMLElement | null;

  if (departmentElement) {
    const departmentText = departmentElement.innerHTML.split('<br>')[0].trim();
    saveDataToStorage('department', departmentText);
  }

  if (body && row) {
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
          <TooltipProvider>{href.includes('siganpyo_aui.jsp') ? <SubjectApp /> : <SugangApp />}</TooltipProvider>
        </React.StrictMode>
      </ShadowRootContext.Provider>
    );

    // 토글 상태를 저장할 키
    const TOGGLE_STATE_KEY = 'toggleState';

    // 대상 요소들 선택
    const targetElement = document.querySelector(
      '#div_print_area > div > div._obj._objHtml._absolute'
    ) as HTMLElement | null;
    const targetElementTitle = document.querySelector('#div_print_area > div > div.title') as HTMLElement | null;

    // 초기 토글 상태 불러오기
    loadDataFromStorage(TOGGLE_STATE_KEY, (savedToggleState) => {
      const isToggled = savedToggleState === 'true';

      if (targetElement && targetElementTitle && host) {
        if (isToggled) {
          targetElement.style.display = 'none';
          targetElementTitle.style.display = 'none';
          host.style.display = 'block';
        } else {
          targetElement.style.display = 'block';
          targetElementTitle.style.display = 'block';
          host.style.display = 'none';
        }
      }
    });

    // 스토리지 변경 이벤트 리스너 추가
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'toggle') {
        const { isToggled } = message;
        const targetElement = document.querySelector(
          '#div_print_area > div > div._obj._objHtml._absolute'
        ) as HTMLElement | null;
        const targetElementTitle = document.querySelector('#div_print_area > div > div.title') as HTMLElement | null;
        const host = document.querySelector('#extension-content-root') as HTMLElement | null;

        if (targetElement && targetElementTitle && host) {
          if (isToggled) {
            targetElement.style.display = 'none';
            targetElementTitle.style.display = 'none';
            host.style.display = 'block';
          } else {
            targetElement.style.display = 'block';
            targetElementTitle.style.display = 'block';
            host.style.display = 'none';
          }
          // 상태 저장
          saveDataToStorage('toggleState', isToggled ? 'true' : 'false');
          sendResponse({ status: 'success' });
        } else {
          sendResponse({ status: 'failure', message: '요소를 찾을 수 없습니다.' });
        }
      }
      return true;
    });
  }
}
