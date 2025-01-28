import { useState, useEffect } from 'react';
import { Semester } from '@/types/types';
import { fetchSemesterData } from './fetchAPI';

interface UseSemestersResult {
  semestersData: { [year: string]: Semester[] };
  loading: boolean;
  error: string | null;
}

export const useSemesters = (): UseSemestersResult => {
  const [semestersData, setSemestersData] = useState<{ [year: string]: Semester[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndSetSemesters = async () => {
      try {
        await fetchSemesterData({ setSemestersData, setLoading });
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    fetchAndSetSemesters();
  }, []);

  return { semestersData, loading, error };
};
