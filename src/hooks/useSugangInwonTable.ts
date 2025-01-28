import { useState, useMemo } from 'react';
import type { SugangInwon, GroupedSugangInwon, SortDirection } from '@/types/types';

export function useSugangInwonTable(sugangs: SugangInwon[]) {
  const [sortColumn, setSortColumn] = useState<keyof SugangInwon | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<Record<string, Set<string>>>({});
  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set());

  const groupedData: GroupedSugangInwon[] = useMemo(() => {
    const map = new Map<string, SugangInwon[]>();
    setFilters({});
    sugangs.forEach((subj) => {
      const list = map.get(subj.gwamokcode) || [];
      list.push(subj);
      map.set(subj.gwamokcode, list);
    });
    return Array.from(map.entries()).map(([gwamokcode, subjects]) => ({
      gwamokcode,
      master: subjects[0],
      details: subjects,
    }));
  }, [sugangs]);

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

  const toggleExpand = (gwamokcode: string) => {
    setExpandedSet((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(gwamokcode)) {
        newSet.delete(gwamokcode);
      } else {
        newSet.add(gwamokcode);
      }
      return newSet;
    });
  };

  const filteredAndSorted = useMemo(() => {
    const data = groupedData.filter((group) => {
      return Object.entries(filters).every(([colId, setOfVals]) => {
        if (setOfVals.size === 0) return true;
        const cellValue = String(group.master[colId as keyof SugangInwon] || '');
        return setOfVals.has(cellValue);
      });
    });

    if (sortColumn) {
      data.sort((a, b) => {
        const valA = a.master[sortColumn];
        const valB = b.master[sortColumn];

        // 숫자와 문자열을 구분하여 정렬
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        const strValA = String(valA || '');
        const strValB = String(valB || '');
        return sortDirection === 'asc' ? strValA.localeCompare(strValB) : strValB.localeCompare(strValA);
      });
    }

    return data;
  }, [groupedData, filters, sortColumn, sortDirection]);

  return {
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
  };
}
