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
import type { SugangInwon, SugangMasterColumn, SugangDetailColumn, GroupedSugangInwon } from '@/types/types';
import ListFilterPlus from '@/assets/filter.svg';
import { useSugangInwonMasterDetailTable } from '@/hooks/useSugangInwonMasterDetail';
import DetailTable from './components/SugangInwonDetailTable';

const masterColumns: SugangMasterColumn[] = [
  { id: 'gwamokcode', label: '과목코드', width: 65, sortable: false, filterable: false },
  { id: 'gwamokname', label: '과목명', width: 160, sortable: true, filterable: true },
  { id: 'isu', label: '이수구분', width: 80, sortable: false, filterable: true },
  { id: 'haknean', label: '학년', width: 60, sortable: true, filterable: true },
  { id: 'hakjum', label: '학점', width: 60, sortable: true, filterable: true },
];

const detailColumns: SugangDetailColumn[] = [
  { id: 'juya', label: '주/야', width: 35, sortable: true, filterable: true },
  { id: 'bunban', label: '분반', width: 25, sortable: true, filterable: false },
  { id: 'profname', label: '교수', width: 40, sortable: true, filterable: true },
  { id: 'ta1', label: '타과1학년', width: 40, sortable: true, filterable: false },
  { id: 'ta2', label: '타과2학년', width: 40, sortable: true, filterable: false },
  { id: 'ta3', label: '타과3학년', width: 40, sortable: true, filterable: false },
  { id: 'ta4', label: '타과4학년', width: 40, sortable: true, filterable: false },
  { id: 'pyun', label: '편입', width: 25, sortable: true, filterable: false },
  { id: 'jahaknean', label: '자과개설학년', width: 45, sortable: true, filterable: false },
  { id: 'total', label: '총잔여인원', width: 45, sortable: true, filterable: false },
  { id: 'pre_sugang', label: '장바구니인원', width: 45, sortable: true, filterable: false },
];

const SugangInwonMasterTable: React.FC<{
  sugangs: SugangInwon[];
  setLength: (length: number) => void;
}> = ({ sugangs, setLength }) => {
  const {
    // Master 상태 및 핸들러
    sortColumnMaster,
    sortDirectionMaster,
    filtersMaster,
    handleMasterSort,
    handleMasterCheckboxFilterChange,
    clearMasterFilters,

    // 확장된 행 상태
    expandedSet,
    groupedData,
    filteredAndSorted,
    toggleExpand,
  } = useSugangInwonMasterDetailTable(sugangs);

  useEffect(() => {
    setLength(filteredAndSorted.length);
  }, [filteredAndSorted]);
  const [searchTermsMaster, setSearchTermsMaster] = useState<Record<string, string>>({});

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

  // Popover 상태 관리 (Master)
  const [openPopoverMaster, setOpenPopoverMaster] = useState<Record<string, boolean>>({});

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Master 테이블 헤더 */}
      <div className="flex-none">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-gray-100">
            <TableRow>
              {/* Master 컬럼 헤더 */}
              {masterColumns.map((col, index) => {
                const isLastColumn = index === masterColumns.length - 1;
                const nextCol = masterColumns[index + 1];

                return (
                  <TableHeaderCell
                    key={`master-${col.id}`}
                    className="relative overflow-hidden bg-gray-100"
                    style={{ width: columnWidths[col.id] }}
                  >
                    <div className="flex items-center justify-between h-full">
                      <Button
                        variant="ghost"
                        onClick={() => handleMasterSort(col.id, col.sortable)}
                        className={
                          col.sortable
                            ? 'cursor-pointer flex items-center min-w-0 px-1 py-0.5'
                            : 'cursor-default flex items-center min-w-0 px-1 py-0.5'
                        }
                      >
                        <span className="truncate flex-grow min-w-0" title={col.label}>
                          {col.label}
                        </span>
                        {sortColumnMaster === col.id &&
                          (sortDirectionMaster === 'asc' ? (
                            <ArrowUp className="m-0 p-0 ml-0.5 h-4 w-4 flex-shrink-0" />
                          ) : (
                            <ArrowDown className="m-0 p-0 h-4 ml-0.5 w-4 flex-shrink-0" />
                          ))}
                      </Button>
                      {col.filterable && (
                        <Popover
                          open={openPopoverMaster[col.id] || false}
                          onOpenChange={(open) =>
                            setOpenPopoverMaster((prev) => ({
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
                                setOpenPopoverMaster((prev) => ({
                                  ...prev,
                                  [col.id]: !prev[col.id],
                                }));
                              }}
                            >
                              {filtersMaster[col.id]?.size > 0 ? (
                                <img src={ListFilterPlus} className="p-0 m-0 h-4 w-4" alt="필터 적용됨" />
                              ) : (
                                <ListFilter className="h-3 w-3" />
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className={`${col.label === '과목명' ? 'w-[300px]' : 'w-[200px]'} bg-white z-50 p-2 shadow-lg rounded-md`}
                            onInteractOutside={() => setOpenPopoverMaster((prev) => ({ ...prev, [col.id]: false }))}
                          >
                            <div className="dropdown-menu-content">
                              <Input
                                placeholder="검색..."
                                className="mb-2 w-full"
                                value={searchTermsMaster[col.id] || ''}
                                onChange={(e) => {
                                  setSearchTermsMaster((prev) => ({ ...prev, [col.id]: e.target.value }));
                                }}
                              />
                              <div
                                className={`${col.label === '과목명' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : 'grid grid-cols-1'} overflow-y-scroll max-h-60 overscroll-contain`}
                              >
                                {Array.from(new Set(groupedData.map((group) => group.master[col.id])))
                                  .filter((value) =>
                                    value.toLowerCase().includes((searchTermsMaster[col.id] || '').toLowerCase())
                                  )
                                  .map((val) => (
                                    <div key={`master-${col.id}-${val}`} className="flex items-center space-x-2 mb-1">
                                      <Checkbox
                                        id={`master-${col.id}-${val}`}
                                        checked={filtersMaster[col.id]?.has(val) || false}
                                        onCheckedChange={() => {
                                          handleMasterCheckboxFilterChange(col.id, val);
                                        }}
                                        className="w-4 h-4"
                                      />
                                      <label
                                        htmlFor={`master-${col.id}-${val}`}
                                        className="text-sm flex-grow cursor-pointer overflow-hidden text-ellipsis line-clamp-1"
                                      >
                                        {val === '' ? '없음' : val}
                                      </label>
                                    </div>
                                  ))}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full"
                                onClick={() => clearMasterFilters(col.id)}
                              >
                                모두 지우기
                              </Button>
                              <Button
                                variant={'default'}
                                size="sm"
                                className="mt-1 w-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenPopoverMaster((prev) => ({
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
              {filteredAndSorted.map((group: GroupedSugangInwon) => (
                <React.Fragment key={group.gwamokcode}>
                  {/* Master Row */}
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => toggleExpand(group.gwamokcode)}
                    className="cursor-pointer bg-white hover:bg-gray-100"
                  >
                    {masterColumns.map((col) => (
                      <TableCell
                        key={`master-${col.id}`}
                        style={{ width: columnWidths[col.id] }}
                        className="truncate px-2 py-3"
                      >
                        <div className="truncate" title={group.master[col.id]}>
                          {group.master[col.id]}
                        </div>
                      </TableCell>
                    ))}
                  </motion.tr>

                  {/* Detail Row */}
                  <AnimatePresence>
                    {expandedSet.has(group.gwamokcode) && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TableCell colSpan={masterColumns.length} className="p-0">
                          <DetailTable group={group} detailColumns={detailColumns} />
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
  );
};

export default SugangInwonMasterTable;
