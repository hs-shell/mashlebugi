import { useState, useMemo } from 'react';
import type { SugangInwon, SortDirection } from '@/types/types';

export function useSugangInwonTable(sugangs: SugangInwon[]) {
  const [sortColumn, setSortColumn] = useState<keyof SugangInwon | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<Record<string, Set<string>>>({});

  const handleSort = (colId: keyof SugangInwon, sortable: boolean) => {
    if (!sortable) return;
    if (sortColumn !== colId) {
      setSortColumn(colId);
      setSortDirection('asc');
    } else {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    }
  };

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

  const clearAllFilters = (colId: string) => {
    setFilters((prev) => ({ ...prev, [colId]: new Set() }));
  };

  const filteredAndSorted = useMemo(() => {
    let data = sugangs.filter((item) => {
      return Object.entries(filters).every(([colId, setOfVals]) => {
        if (setOfVals.size === 0) return true;
        const cellValue = String(item[colId as keyof SugangInwon] || '');
        return setOfVals.has(cellValue);
      });
    });

    if (sortColumn) {
      data = [...data].sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        // 숫자 변환 가능 여부 확인
        const numA = Number(valA);
        const numB = Number(valB);
        const isNumA = !isNaN(numA);
        const isNumB = !isNaN(numB);

        if (isNumA && isNumB) {
          // 둘 다 숫자인 경우 숫자 비교
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }

        // 둘 다 문자열이거나 하나만 숫자인 경우 문자열 비교
        const strValA = String(valA || '');
        const strValB = String(valB || '');
        return sortDirection === 'asc' ? strValA.localeCompare(strValB) : strValB.localeCompare(strValA);
      });
    }

    return data;
  }, [sugangs, filters, sortColumn, sortDirection]);

  return {
    sortColumn,
    sortDirection,
    filters,
    filteredAndSorted,
    handleSort,
    handleCheckboxFilterChange,
    clearAllFilters,
  };
}
