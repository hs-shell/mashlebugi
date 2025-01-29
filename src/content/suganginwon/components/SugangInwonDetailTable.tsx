import React, { useState, useMemo } from 'react';
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
import type { SugangInwon, SugangDetailColumn, GroupedSugangInwon } from '@/types/types';
import ListFilterPlus from '@/assets/filter.svg';

interface DetailTableProps {
  group: GroupedSugangInwon;
  detailColumns: SugangDetailColumn[];
}

const SugangInwonDetailTable: React.FC<DetailTableProps> = ({ group, detailColumns }) => {
  // 독립적인 정렬 및 필터링 상태 관리
  const [sortColumn, setSortColumn] = useState<keyof SugangInwon | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, Set<string>>>({});
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const [openPopover, setOpenPopover] = useState<Record<string, boolean>>({});

  // 정렬 핸들러
  const handleSort = (colId: keyof SugangInwon, sortable: boolean) => {
    if (!sortable) return;
    if (sortColumn !== colId) {
      setSortColumn(colId);
      setSortDirection('asc');
    } else {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    }
  };

  // 필터 변경 핸들러
  const handleCheckboxFilterChange = (colId: string, value: string) => {
    setFilters((prev) => {
      const newSet = new Set(prev[colId] || []);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return { ...prev, [colId]: newSet };
    });
  };

  // 필터 초기화 핸들러
  const clearFilters = (colId: string) => {
    setFilters((prev) => ({ ...prev, [colId]: new Set() }));
  };

  // 정렬 및 필터링된 데이터 계산
  const sortedAndFilteredDetails = useMemo(() => {
    let details = [...group.details];

    // 필터링
    details = details.filter((detail) =>
      Object.entries(filters).every(([colId, setOfVals]) => {
        if (setOfVals.size === 0) return true;
        const cellValue = String(detail[colId as keyof SugangInwon] || '');
        return setOfVals.has(cellValue);
      })
    );

    // 정렬
    if (sortColumn) {
      details.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        const strValA = String(valA || '');
        const strValB = String(valB || '');
        return sortDirection === 'asc' ? strValA.localeCompare(strValB) : strValB.localeCompare(strValA);
      });
    }

    return details;
  }, [group.details, filters, sortColumn, sortDirection]);

  return (
    <div className="border rounded-lg m-2 mb-4 overflow-hidden">
      <Table className="table-fixed w-full">
        <TableHeader className="bg-gray-50">
          <TableRow>
            {detailColumns.map((col) => (
              <TableHeaderCell
                key={`detail-header-${col.id}`}
                className="px-1.5 relative overflow-hidden bg-gray-100"
                style={{ width: col.width }}
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
                    <span className="truncate flex-grow min-w-0" title={col.label} style={{ fontSize: 13 }}>
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
                            <img src={ListFilterPlus} className="p-0 m-0 h-4 w-4" alt="필터 적용됨" />
                          ) : (
                            <ListFilter className="h-3 w-3" />
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className={`w-[200px] bg-white z-50 p-2 shadow-lg rounded-md`}
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
                          <div className={`grid grid-cols-1 overflow-y-scroll max-h-60 overscroll-contain`}>
                            {Array.from(new Set(group.details.map((detail) => detail[col.id as keyof SugangInwon])))
                              .filter((value): value is string => typeof value === 'string')
                              .filter((value) =>
                                value.toLowerCase().includes((searchTerms[col.id] || '').toLowerCase())
                              )
                              .map((val) => (
                                <div key={`detail-${col.id}-${val}`} className="flex items-center space-x-2 mb-1">
                                  <Checkbox
                                    id={`detail-${col.id}-${val}`}
                                    checked={filters[col.id]?.has(val) || false}
                                    onCheckedChange={() => {
                                      handleCheckboxFilterChange(col.id, val);
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <label
                                    htmlFor={`detail-${col.id}-${val}`}
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
                            onClick={() => clearFilters(col.id)}
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
                {/* 컬럼 간 경계선을 위한 border */}
                <div className="absolute right-0 top-1/4 h-1/2 border-r border-gray-300 pointer-events-none" />
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAndFilteredDetails.map((detail, idx) => (
            <TableRow key={`${detail.gwamokcode}_${idx}`} className="bg-white hover:bg-gray-100">
              {detailColumns.map((dc) => (
                <TableCell
                  key={`detail-${dc.id}-${idx}`}
                  style={{ width: dc.width }}
                  className={`truncate px-4 py-2 ${dc.id === 'total' ? 'bg-sky-50 hover:bg-sky-50' : ''}`}
                >
                  <div className="truncate text-xs" title={String(detail[dc.id as keyof SugangInwon] || '')}>
                    {String(detail[dc.id as keyof SugangInwon] || '')}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SugangInwonDetailTable;
