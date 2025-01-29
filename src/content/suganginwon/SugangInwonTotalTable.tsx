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
import type { SugangInwon, SugangColumn } from '@/types/types';
import ListFilterPlus from '@/assets/filter.svg';
import { useSugangInwonTable } from '@/hooks/useSugangInwonTable';

const columns: SugangColumn[] = [
  { id: 'gwamokcode', label: '과목코드', width: 25, minWidth: 25, sortable: false, filterable: false },
  { id: 'gwamokname', label: '과목명', width: 50, minWidth: 35, sortable: true, filterable: true },
  { id: 'juya', label: '주야', width: 20, minWidth: 20, sortable: false, filterable: true },
  { id: 'bunban', label: '분반', width: 15, minWidth: 10, sortable: false, filterable: false },
  { id: 'profname', label: '교수', width: 25, minWidth: 20, sortable: false, filterable: true },
  { id: 'haknean', label: '학년', width: 20, minWidth: 15, sortable: false, filterable: true },
  { id: 'hakjum', label: '학점', width: 20, minWidth: 15, sortable: false, filterable: true },
  { id: 'isu', label: '이수구분', width: 20, minWidth: 15, sortable: false, filterable: true },
  { id: 'cross_juya', label: '교차여부', width: 20, minWidth: 15, sortable: false, filterable: true },
  { id: 'ta1', label: '타과1학년', width: 22, minWidth: 15, sortable: true, filterable: false },
  { id: 'ta2', label: '타과2학년', width: 22, minWidth: 15, sortable: true, filterable: false },
  { id: 'ta3', label: '타과3학년', width: 22, minWidth: 15, sortable: true, filterable: false },
  { id: 'ta4', label: '타과4학년', width: 22, minWidth: 15, sortable: true, filterable: false },
  { id: 'pyun', label: '편입', width: 17, minWidth: 10, sortable: true, filterable: false },
  { id: 'jahaknean', label: '자과개설학년', width: 30, minWidth: 20, sortable: true, filterable: false },
  { id: 'total', label: '총잔여인원', width: 30, minWidth: 20, sortable: true, filterable: false },
  { id: 'pre_sugang', label: '장바구니인원', width: 30, minWidth: 20, sortable: true, filterable: false },
];

export const SugangInwonTotalTable: React.FC<{
  sugangs: SugangInwon[];
  setLength: (length: number) => void;
}> = ({ sugangs, setLength }) => {
  const {
    sortColumn,
    sortDirection,
    filters,
    filteredAndSorted,
    handleSort,
    handleCheckboxFilterChange,
    clearAllFilters,
  } = useSugangInwonTable(sugangs);

  useEffect(() => {
    setLength(filteredAndSorted.length);
  }, [filteredAndSorted]);
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  // 컬럼 가시성 상태 추가
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    columns.reduce(
      (acc, col) => {
        acc[col.id] = true;
        return acc;
      },
      {} as Record<string, boolean>
    )
  );

  const toggleColumn = (colId: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [colId]: !prev[colId],
    }));
  };

  // 컬럼 너비 상태 관리
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    columns.reduce(
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

  // 더 이상 전역 MIN_WIDTH를 사용하지 않고, 각 컬럼의 minWidth를 사용
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

      const leftCol = columns.find((col) => col.id === leftId);
      const rightCol = columns.find((col) => col.id === rightId);

      const leftMinWidth = leftCol?.minWidth || 20;
      const rightMinWidth = rightCol?.minWidth || 20;

      // left 컬럼이 최소 너비 이상 유지되도록 deltaX 제한
      let adjustedDeltaX = deltaX;
      if (startLeftWidth + deltaX < leftMinWidth) {
        adjustedDeltaX = leftMinWidth - startLeftWidth;
      }

      // right 컬럼이 최소 너비 이상 유지되도록 deltaX 제한
      if (startRightWidth - adjustedDeltaX < rightMinWidth) {
        adjustedDeltaX = startRightWidth - rightMinWidth;
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

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto">
      {/* 테이블 헤더 */}
      <div className="flex-none overflow-x-auto">
        <Table className="table-fixed w-full min-w-max">
          <TableHeader className="bg-gray-100">
            <TableRow>
              {columns.map((col, index) => {
                if (!visibleColumns[col.id]) return null; // 컬럼 숨기기

                const isLastColumn = index === columns.length - 1;
                const nextCol = columns[index + 1];

                return (
                  <TableHeaderCell
                    key={col.id}
                    className="relative overflow-hidden bg-gray-100 px-1"
                    style={{
                      width: columnWidths[col.id],
                      minWidth: col.minWidth, // minWidth 적용
                    }}
                  >
                    <div className="flex items-center justify-center h-full">
                      {col.filterable && <div />}
                      <Button
                        variant="ghost"
                        onClick={() => handleSort(col.id, col.sortable)}
                        className={`
                            ${col.sortable ? 'cursor-pointer' : 'cursor-default'}
                            flex items-center justify-center w-full px-0.5 py-0.5 h-full
                          `}
                      >
                        <div className="p-0 m-0 text-center flex items-center justify-center">
                          <span
                            className="flex text-center text-xs leading-tight break-words"
                            title={col.label}
                            style={{
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              fontSize: 11,
                              lineHeight: '1.2',
                            }}
                          >
                            {col.label}
                          </span>
                          {col.sortable &&
                            sortColumn === col.id &&
                            (sortDirection === 'asc' ? (
                              <ArrowUp className="h-2 w-2 flex-shrink-0" />
                            ) : (
                              <ArrowDown className="h-2 w-2 flex-shrink-0" />
                            ))}
                        </div>
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
                              className={`flex-shrink-0 px-0.5 py-0 shadow-none`}
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
                                <ListFilter className="h-2 w-2" />
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className={`${
                              col.label === '과목명' ? 'w-[300px]' : 'w-[200px]'
                            } bg-white z-50 p-2 shadow-lg rounded-md`}
                            onInteractOutside={() => setOpenPopover((prev) => ({ ...prev, [col.id]: false }))}
                          >
                            <div className="dropdown-menu-content">
                              <Input
                                placeholder="검색..."
                                className="mb-2 w-full"
                                value={searchTerms[col.id] || ''}
                                onChange={(e) => {
                                  setSearchTerms((prev) => ({
                                    ...prev,
                                    [col.id]: e.target.value,
                                  }));
                                }}
                              />
                              <div
                                className={`${
                                  col.label === '과목명' || col.label === '교수'
                                    ? 'grid grid-cols-1 sm:grid-cols-2 gap-2'
                                    : 'grid grid-cols-1'
                                } overflow-y-scroll max-h-60 overscroll-contain`}
                              >
                                {Array.from(new Set(sugangs.map((subj) => subj[col.id])))
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
        <Table className="table-fixed w-full min-w-max">
          <TableBody>
            <AnimatePresence>
              {filteredAndSorted.map((item) => (
                <motion.tr
                  key={item.gwamokcode + item.profname + item.bunban} // 각 항목에 고유 키 필요
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white hover:bg-gray-100"
                >
                  {columns.map((col) => {
                    if (!visibleColumns[col.id]) return null;

                    return (
                      <TableCell
                        key={col.id}
                        style={{
                          width: columnWidths[col.id],
                          minWidth: col.minWidth, // minWidth 적용
                        }}
                        className={`px-0.5 py-3 ${col.id === 'total' ? 'bg-sky-50 hover:bg-sky-50' : ''}`}
                      >
                        <div
                          className="break-words text-center line-clamp-1 overflow-ellipsis"
                          title={item[col.id]}
                          style={{
                            fontSize: 11,
                          }}
                        >
                          {item[col.id]}
                        </div>
                      </TableCell>
                    );
                  })}
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SugangInwonTotalTable;
