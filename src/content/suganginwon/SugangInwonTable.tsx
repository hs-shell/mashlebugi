import React, { useState } from 'react';
import type { SugangInwon } from '@/types/types';
import TableToggle from './components/table-toggle';
import { ViewType } from './DepartmentSelector';
import SugangInwonMasterTable from './SugangInwonMasterTable';
import SugangInwonTotalTable from './SugangInwonTotalTable';

const SugangInwonTable: React.FC<{
  sugangs: SugangInwon[];
}> = ({ sugangs }) => {
  const [view, setView] = useState<ViewType>('master-detail');
  const [length, setLength] = useState(0);
  return (
    <div className="flex flex-col h-[550px] border rounded-lg overflow-hidden bg-white">
      {/* 헤더 */}
      <div className="flex p-4 bg-white border-b justify-between items-center z-10">
        <h2 className="text-xl font-semibold">잔여 인원</h2>
        <TableToggle view={view} setView={setView} />
      </div>
      {/* 테이블 컨테이너 */}
      {view === 'master-detail' ? (
        <SugangInwonMasterTable sugangs={sugangs} setLength={setLength} />
      ) : (
        <SugangInwonTotalTable sugangs={sugangs} setLength={setLength} />
      )}

      <div className="flex-none p-4 bg-white border-t text-right z-10">
        <p>{length}개 표시 중</p>
      </div>
    </div>
  );
};

export default SugangInwonTable;
