import { useEffect, useState } from 'react';
import hsuLogo from '@/assets/hsu.png';
import { loadDataFromStorage, saveDataToStorage } from '@/hooks/storage';

function App() {
  const [toggleState, setToggleState] = useState<string>('false');

  useEffect(() => {
    // 초기 토글 상태 불러오기
    loadDataFromStorage('toggleState', (data: string | null) => {
      if (!data) {
        saveDataToStorage('toggleState', 'false');
      } else {
        setToggleState(data);
      }
    });
  }, []);

  const handleToggle = () => {
    const newState = toggleState === 'true' ? 'false' : 'true';
    setToggleState(newState);
    saveDataToStorage('toggleState', newState);

    // 현재 활성 탭의 콘텐츠 스크립트로 메시지 전송
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle', isToggled: newState === 'true' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
          } else {
            console.log('메시지 전송 응답:', response);
          }
        });
      }
    });
  };

  return (
    <div
      className="max-w-screen-md p-8 text-center flex flex-col justify-center items-center"
      style={{
        margin: 0,
        display: 'flex',
        placeItems: 'center',
        minWidth: '320px',
        minHeight: '100vh',
      }}
    >
      <div className="flex justify-center items-center space-x-4 mb-8 gap-4">
        <a href="https://www.hansung.ac.kr/sites/hansung/index.do" target="_blank">
          <img
            src={hsuLogo}
            className="h-16 p-1 transition filter hover:drop-shadow-[0_0_2em_rgba(100,108,255,0.67)]"
            alt="HSU LOGO"
          />
        </a>
      </div>
      <h1 className="text-2xl font-bold leading-tight">종합정보시스템</h1>
      <div className="card p-4 my-6 border rounded-lg">
        <button
          onClick={handleToggle}
          className={`rounded-lg border border-transparent px-4 py-2 text-md w-full font-semibold text-zinc-100 ${toggleState === 'false' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-zinc-800 hover:bg-zinc-950'} transition`}
        >
          {toggleState === 'true' ? '원래 버전' : '개선 버전'}
        </button>
        <ul className="list-disc pl-5 w-full py-4 text-left">
          <li>개선 버전은 오류가 있을 수 있습니다.</li>
          <li>오류 발생 시 새로고침 해주세요</li>
        </ul>
      </div>
      <p className="mt-3">
        <a
          href="https://github.com/6-keem"
          target="_blank"
          className="text-zinc-600 hover:text-zinc-900 transition-colors duration-150"
        >
          6-keem
        </a>
      </p>
    </div>
  );
}

export default App;
