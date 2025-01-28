import { useState, useMemo } from 'react';
import type { Subject, GroupedSubject, SortDirection } from '@/types/types';

export function useSubjectsTable(sbjs: Subject[]) {
  const [sortColumn, setSortColumn] = useState<keyof Subject | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<Record<string, Set<string>>>({});
  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set());

  const groupedData: GroupedSubject[] = useMemo(() => {
    const map = new Map<string, Subject[]>();
    sbjs.forEach((subj) => {
      const list = map.get(subj.kwamokcode) || [];
      list.push(subj);
      map.set(subj.kwamokcode, list);
    });
    return Array.from(map.entries()).map(([kwamokcode, subjects]) => ({
      kwamokcode,
      master: subjects[0],
      details: subjects,
    }));
  }, [sbjs]);

  const handleSort = (colId: keyof Subject, sortable: boolean) => {
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

  const toggleExpand = (kwamokcode: string) => {
    setExpandedSet((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(kwamokcode)) {
        newSet.delete(kwamokcode);
      } else {
        newSet.add(kwamokcode);
      }
      return newSet;
    });
  };

  const filteredAndSorted = useMemo(() => {
    const data = groupedData.filter((group) => {
      return Object.entries(filters).every(([colId, setOfVals]) => {
        if (setOfVals.size === 0) return true;
        const cellValue = String(group.master[colId as keyof Subject] || '');
        return setOfVals.has(cellValue);
      });
    });

    if (sortColumn) {
      data.sort((a, b) => {
        const valA = String(a.master[sortColumn] || '');
        const valB = String(b.master[sortColumn] || '');
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
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
