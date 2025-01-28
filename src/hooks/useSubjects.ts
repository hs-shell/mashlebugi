// hooks/useSubjects.ts
import { useState, useEffect } from 'react';
import { Subject } from '@/types/types';
import { fetchSubjectsData } from './fetchAPI';

interface UseSubjectsParams {
  departmentCode: string | null;
  semesterCode: string | null;
}

interface UseSubjectsResult {
  subjectsData: Subject[];
  loading: boolean;
  error: string | null;
}

export const useSubjects = ({ departmentCode, semesterCode }: UseSubjectsParams): UseSubjectsResult => {
  const [subjectsData, setSubjectsData] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!departmentCode || !semesterCode) {
      setSubjectsData([]);
      return;
    }

    const fetchAndSetSubjects = async () => {
      setLoading(true);
      try {
        await fetchSubjectsData({ code: departmentCode, semester: semesterCode, setSubjectsData, setLoading });
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    fetchAndSetSubjects();
  }, [departmentCode, semesterCode]);

  return { subjectsData, loading, error };
};
