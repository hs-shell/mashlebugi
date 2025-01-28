// hooks/useDepartments.ts
import { useState, useEffect } from 'react';
import { Department } from '@/types/types';
import { fetchDepartmentData } from './fetchAPI';

interface UseDepartmentsParams {
  semester: string | null;
}

interface UseDepartmentsResult {
  groupedData: { [university: string]: { [faculty: string]: Department[] } };
  loading: boolean;
  error: string | null;
}

export const useDepartments = ({ semester }: UseDepartmentsParams): UseDepartmentsResult => {
  const [groupedData, setGroupedData] = useState<{ [university: string]: { [faculty: string]: Department[] } }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!semester) {
      setGroupedData({});
      return;
    }

    const fetchAndSetDepartments = async () => {
      setLoading(true);
      try {
        await fetchDepartmentData({ semester, setGroupedData, setLoading });
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    fetchAndSetDepartments();
  }, [semester]);

  return { groupedData, loading, error };
};
