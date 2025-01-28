import React, { useState, useRef, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead as TableHeaderCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowUp, ArrowDown, ListFilter } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSubjectsTable } from '@/hooks/useSubjectsTable';
import type { Subject, MasterColumn, DetailColumn } from '@/types/types';
import CourseDetailModal from './components/CourseDetailModal';
import CourseEvaluationModal from './components/CourseEvaluationModal';
import ListFilterPlus from '@/assets/filter.svg';

const masterColumns: MasterColumn[] = [
  { id: 'kwamokcode', label: '과목코드', width: 65, sortable: false, filterable: false },
  { id: 'kwamokname', label: '과목명', width: 160, sortable: true, filterable: true },
  { id: 'isugubun', label: '이수구분', width: 80, sortable: false, filterable: true },
  { id: 'hakjum', label: '학점', width: 60, sortable: true, filterable: true },
  { id: 'haknean', label: '학년', width: 60, sortable: true, filterable: true },
  { id: 'kwamokgubun', label: '과목구분', width: 80, sortable: false, filterable: true },
];

const detailColumns: DetailColumn[] = [
  { id: 'juya', label: '주/야', width: 40 },
  { id: 'bunban', label: '분반', width: 40 },
  { id: 'prof', label: '교수', width: 60 },
  { id: 'classroom', label: '강의실', width: 180 },
  { id: 'cross_juya', label: '주야교차', width: 60 },
  { id: 'plan', label: '계획서', width: 45 },
];

export const SubjectsTable: React.FC<{ sbjs: Subject[] }> = ({ sbjs }) => {
  const {
    sortColumn,
    sortDirection,
    filters,
    expandedSet,
    groupedData,
    filteredAndSorted,
    handleSort,
    handleCheckboxFilterChange,
    toggleExpand,
    clearAllFilters,
  } = useSubjectsTable(sbjs);

  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  // 컬럼 너비 상태 관리
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    masterColumns.reduce(
      (acc, col) => {
        acc[col.id] = col.width;
        return acc;
      },
      {} as Record<string, number>
    )
  );

  // 드래그 핸들링을 위한 참조
  const startXRef = useRef<number>(0);
  const startWidthsRef = useRef<{ left: number; right: number }>({ left: 0, right: 0 });
  const currentResizerRef = useRef<{ leftId: string; rightId: string } | null>(null);

  const MIN_WIDTH = 50; // 최소 너비 설정

  const handleMouseDown = (e: React.MouseEvent, leftColId: string, rightColId: string) => {
    e.preventDefault(); // 드래그 시 선택 방지
    startXRef.current = e.clientX;
    startWidthsRef.current = {
      left: columnWidths[leftColId],
      right: columnWidths[rightColId],
    };
    currentResizerRef.current = { leftId: leftColId, rightId: rightColId };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (currentResizerRef.current) {
      const deltaX = e.clientX - startXRef.current;
      const { leftId, rightId } = currentResizerRef.current;

      const startLeftWidth = startWidthsRef.current.left;
      const startRightWidth = startWidthsRef.current.right;

      // left 컬럼이 최소 너비 이상 유지되도록 deltaX 제한
      let adjustedDeltaX = deltaX;
      if (startLeftWidth + deltaX < MIN_WIDTH) {
        adjustedDeltaX = MIN_WIDTH - startLeftWidth;
      }

      // right 컬럼이 최소 너비 이상 유지되도록 deltaX 제한
      if (startRightWidth - adjustedDeltaX < MIN_WIDTH) {
        adjustedDeltaX = startRightWidth - MIN_WIDTH;
      }

      const newLeftWidth = startLeftWidth + adjustedDeltaX;
      const newRightWidth = startRightWidth - adjustedDeltaX;

      setColumnWidths((prev) => ({
        ...prev,
        [leftId]: newLeftWidth,
        [rightId]: newRightWidth,
      }));
    }
  };

  const handleMouseUp = () => {
    currentResizerRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Popover 상태 관리
  const [openPopover, setOpenPopover] = useState<Record<string, boolean>>({});

  const openPopup = (code: string) => {
    const width = 600;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    window.open(
      `https://info.hansung.ac.kr/jsp_21/student/kyomu/suupplan_main_view.jsp?code=${code}`,
      '수업 계획서',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=no`
    );
  };

  // 모달 상태 관리
  const [isCourseDetailModalOpen, setIsCourseDetailModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string>('');

  const [isCourseEvaluationModalOpen, setIsCourseEvaluationModalOpen] = useState(false);
  const [selectedProfCode, setSelectedProfCode] = useState<string>('');

  useEffect(() => {
    if (isCourseDetailModalOpen || isCourseEvaluationModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCourseDetailModalOpen, isCourseEvaluationModalOpen]);

  return (
    <>
      {isCourseEvaluationModalOpen && (
        <CourseEvaluationModal
          code={selectedProfCode}
          onClose={() => {
            setIsCourseEvaluationModalOpen(false);
          }}
        />
      )}
      {isCourseDetailModalOpen && (
        <CourseDetailModal
          code={selectedCode}
          onClose={() => {
            setIsCourseDetailModalOpen(false);
          }}
        />
      )}
      <div className="flex flex-col h-[550px] border rounded-lg overflow-hidden bg-white">
        {/* 헤더 */}
        <div className="flex-none p-4 bg-white border-b">
          <h2 className="text-xl font-semibold">개설 과목</h2>
        </div>
        {/* 테이블 컨테이너 */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* 테이블 헤더 */}
          <div className="flex-none">
            <Table className="table-fixed w-full">
              <TableHeader className="bg-gray-100">
                <TableRow>
                  {masterColumns.map((col, index) => {
                    const isLastColumn = index === masterColumns.length - 1;
                    const nextCol = masterColumns[index + 1];

                    return (
                      <TableHeaderCell
                        key={col.id}
                        className="relative overflow-hidden bg-gray-100"
                        style={{ width: columnWidths[col.id] }}
                      >
                        <div className="flex items-center justify-between h-full">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort(col.id, col.sortable)}
                            className={
                              col.sortable
                                ? 'cursor-pointer flex items-center min-w-0 px-1 py-0.5'
                                : 'cursor-default flex items-center min-w-0 px-1 py-0.5'
                            }
                          >
                            <span className="truncate flex-grow min-w-0" title={col.label}>
                              {col.label}
                            </span>
                            {sortColumn === col.id &&
                              (sortDirection === 'asc' ? (
                                <ArrowUp className="m-0 p-0 ml-0.5 h-4 w-4 flex-shrink-0" />
                              ) : (
                                <ArrowDown className="m-0 p-0 h-4 ml-0.5 w-4 flex-shrink-0" />
                              ))}
                          </Button>
                          {col.filterable && (
                            <Popover
                              open={openPopover[col.id] || false}
                              onOpenChange={(open) =>
                                setOpenPopover((prev) => ({
                                  ...prev,
                                  [col.id]: open,
                                }))
                              }
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant={'ghost'}
                                  size="sm"
                                  className={`flex-shrink-0 px-1 py-0 shadow-none`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenPopover((prev) => ({
                                      ...prev,
                                      [col.id]: !prev[col.id],
                                    }));
                                  }}
                                >
                                  {filters[col.id]?.size > 0 ? (
                                    <img src={ListFilterPlus} className="p-0 m-0 h-4 w-4" />
                                  ) : (
                                    <ListFilter className="h-3 w-3" />
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className={`${col.label === '과목명' ? 'w-[300px]' : 'w-[200px]'} bg-white z-50 p-2 shadow-lg rounded-md`}
                                onInteractOutside={() => setOpenPopover((prev) => ({ ...prev, [col.id]: false }))}
                              >
                                <div className="dropdown-menu-content">
                                  <Input
                                    placeholder="검색..."
                                    className="mb-2 w-full"
                                    value={searchTerms[col.id] || ''}
                                    onChange={(e) => {
                                      setSearchTerms((prev) => ({ ...prev, [col.id]: e.target.value }));
                                    }}
                                  />
                                  <div
                                    className={`${col.label === '과목명' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : 'grid grid-cols-1'} overflow-y-scroll max-h-60 overscroll-contain`}
                                  >
                                    {Object.values(groupedData)
                                      .map((group) => group.master[col.id])
                                      .filter((value, index, self) => self.indexOf(value) === index)
                                      .filter((value) =>
                                        value.toLowerCase().includes((searchTerms[col.id] || '').toLowerCase())
                                      )
                                      .map((val) => (
                                        <div key={val} className="flex items-center space-x-2 mb-1">
                                          <Checkbox
                                            id={`${col.id}-${val}`}
                                            checked={filters[col.id]?.has(val) || false}
                                            onCheckedChange={() => {
                                              handleCheckboxFilterChange(col.id, val);
                                            }}
                                            className="w-4 h-4"
                                          />
                                          <label
                                            htmlFor={`${col.id}-${val}`}
                                            className="text-sm flex-grow cursor-pointer overflow-hidden text-ellipsis line-clamp-1"
                                          >
                                            {col.label === '과목구분' && val === '' ? '없음' : val}
                                          </label>
                                        </div>
                                      ))}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 w-full"
                                    onClick={() => clearAllFilters(col.id)}
                                  >
                                    모두 지우기
                                  </Button>
                                  <Button
                                    variant={'default'}
                                    size="sm"
                                    className="mt-1 w-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenPopover((prev) => ({
                                        ...prev,
                                        [col.id]: !prev[col.id],
                                      }));
                                    }}
                                  >
                                    닫기
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                        {/* 리사이저 핸들 */}
                        {!isLastColumn && nextCol && (
                          <div
                            className="absolute right-0 top-0 h-full w-2 cursor-col-resize z-10"
                            onMouseDown={(e) => handleMouseDown(e, col.id, nextCol.id)}
                          />
                        )}
                        {/* 컬럼 간 경계선을 위한 border */}
                        {!isLastColumn && (
                          <div className="absolute right-0 top-1/4 h-1/2 border-r border-gray-300 pointer-events-none" />
                        )}
                      </TableHeaderCell>
                    );
                  })}
                </TableRow>
              </TableHeader>
            </Table>
          </div>

          {/* 스크롤 가능한 테이블 바디 */}
          <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
            <Table className="table-fixed w-full">
              <TableBody>
                <AnimatePresence>
                  {filteredAndSorted.map((group) => (
                    <React.Fragment key={group.kwamokcode}>
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => toggleExpand(group.kwamokcode)}
                        className="cursor-pointer bg-white hover:bg-gray-100"
                      >
                        {masterColumns.map((col) => (
                          <TableCell
                            key={col.id}
                            style={{ width: columnWidths[col.id] }}
                            className="truncate px-2 py-3"
                          >
                            {col.id === 'kwamokcode' ? (
                              <Button
                                variant={'ghost'}
                                className="text-blue-500 hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCode(group.master.kwamokcode);
                                  setIsCourseDetailModalOpen(true);
                                }}
                              >
                                {group[col.id]}
                              </Button>
                            ) : (
                              <div className="truncate" title={group.master[col.id]}>
                                {group.master[col.id]}
                              </div>
                            )}
                          </TableCell>
                        ))}
                      </motion.tr>
                      <AnimatePresence>
                        {expandedSet.has(group.kwamokcode) && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <TableCell colSpan={masterColumns.length} className="p-0">
                              <div className="border rounded-lg m-2 mb-4 overflow-hidden">
                                <Table className="table-fixed w-full">
                                  <TableHeader className="bg-gray-50">
                                    <TableRow>
                                      {detailColumns.map((dc) => (
                                        <TableHeaderCell
                                          key={dc.id}
                                          style={{ width: dc.width }}
                                          className="relative overflow-hidden"
                                        >
                                          <div className="truncate px-2 py-1" title={dc.label}>
                                            {dc.label}
                                          </div>
                                        </TableHeaderCell>
                                      ))}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {group.details.map((detail, idx) => (
                                      <TableRow key={`${detail.plan}_${idx}`} className="bg-white hover:bg-gray-100">
                                        {detailColumns.map((dc) => (
                                          <TableCell
                                            key={dc.id}
                                            style={{ width: dc.width }}
                                            className="truncate px-4 py-2"
                                          >
                                            <div className="truncate" title={detail[dc.id]}>
                                              {dc.id === 'prof' ? (
                                                <a
                                                  href="#"
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    setSelectedProfCode(detail['suup_pyunga']);
                                                    setIsCourseEvaluationModalOpen(true);
                                                  }}
                                                  className="text-blue-500 hover:underline"
                                                >
                                                  {detail[dc.id]}
                                                </a>
                                              ) : dc.id === 'plan' ? (
                                                detail.plan ? (
                                                  <a
                                                    href="#"
                                                    onClick={(e) => {
                                                      e.preventDefault();
                                                      openPopup(detail.plan);
                                                    }}
                                                    className="text-blue-500 hover:underline"
                                                  >
                                                    조회
                                                  </a>
                                                ) : (
                                                  '계획서 없음'
                                                )
                                              ) : (
                                                detail[dc.id]
                                              )}
                                            </div>
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex-none p-4 bg-white border-t text-right">
          <p>
            {filteredAndSorted.length}개 중 {filteredAndSorted.length}개 표시 중
          </p>
        </div>
      </div>
    </>
  );
};

export default SubjectsTable;
