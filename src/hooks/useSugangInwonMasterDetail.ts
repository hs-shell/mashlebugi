import { useState, useMemo } from 'react';
import type { SugangInwon, GroupedSugangInwon, SortDirection } from '@/types/types';

export function useSugangInwonMasterDetailTable(sugangs: SugangInwon[]) {
  // Master 정렬 및 필터링 상태
  const [sortColumnMaster, setSortColumnMaster] = useState<keyof SugangInwon | null>(null);
  const [sortDirectionMaster, setSortDirectionMaster] = useState<SortDirection>('asc');
  const [filtersMaster, setFiltersMaster] = useState<Record<string, Set<string>>>({});

  // 확장된 행 상태
  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set());

  // 데이터를 그룹화
  const groupedData: GroupedSugangInwon[] = useMemo(() => {
    const map = new Map<string, SugangInwon[]>();
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

  // Master 정렬 핸들러
  const handleMasterSort = (colId: keyof SugangInwon, sortable: boolean) => {
    if (!sortable) return;
    if (sortColumnMaster !== colId) {
      setSortColumnMaster(colId);
      setSortDirectionMaster('asc');
    } else {
      setSortDirectionMaster((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    }
  };

  // Master 필터링 핸들러
  const handleMasterCheckboxFilterChange = (colId: string, value: string) => {
    setFiltersMaster((prev) => {
      const newSet = new Set(prev[colId] || []);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return { ...prev, [colId]: newSet };
    });
  };

  // Master 필터 초기화 핸들러
  const clearMasterFilters = (colId: string) => {
    setFiltersMaster((prev) => ({ ...prev, [colId]: new Set() }));
  };

  // 행 확장/축소 핸들러
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

  // 필터링 및 정렬된 데이터 계산
  const filteredAndSorted = useMemo(() => {
    // Master 필터링
    let data = groupedData.filter((group) => {
      return Object.entries(filtersMaster).every(([colId, setOfVals]) => {
        if (setOfVals.size === 0) return true;
        const cellValue = String(group.master[colId as keyof SugangInwon] || '');
        return setOfVals.has(cellValue);
      });
    });

    // Master 정렬
    if (sortColumnMaster) {
      data = [...data].sort((a, b) => {
        const valA = a.master[sortColumnMaster];
        const valB = b.master[sortColumnMaster];

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirectionMaster === 'asc' ? valA - valB : valB - valA;
        }
        const strValA = String(valA || '');
        const strValB = String(valB || '');
        return sortDirectionMaster === 'asc' ? strValA.localeCompare(strValB) : strValB.localeCompare(strValA);
      });
    }

    return data;
  }, [groupedData, filtersMaster, sortColumnMaster, sortDirectionMaster]);

  return {
    // Master 상태 및 핸들러
    sortColumnMaster,
    sortDirectionMaster,
    filtersMaster,
    handleMasterSort,
    handleMasterCheckboxFilterChange,
    clearMasterFilters,

    // 기타 상태
    expandedSet,
    groupedData,
    filteredAndSorted,
    toggleExpand,
  };
}
