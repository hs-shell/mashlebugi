import React, { useState, useEffect, useMemo } from 'react';
import { Department, Semester, Subject } from '@/types/types';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchDepartmentData, fetchSemesterData, fetchSubjectsData } from '@/hooks/fetchAPI';
import { SubjectsTable } from './SubjectTable';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover } from '@/components/ui/popover';
import { PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { Button } from '@/components/ui/button';

interface DepartmentSearchResult extends Department {
  university: string;
  faculty: string;
}

const DepartmentSelector: React.FC = () => {
  const [groupedData, setGroupedData] = useState<{ [college: string]: { [faculty: string]: Department[] } }>({});
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [subjectsData, setSubjectsData] = useState<Subject[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentSearchResult | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<DepartmentSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [semestersData, setSemestersData] = useState<{ [year: string]: Semester[] }>({});
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const fetchAndGroupXML = async () => {
      try {
        await fetchSemesterData({ setSemestersData, setLoading });
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    fetchAndGroupXML();
  }, []);

  useEffect(() => {
    if (Object.keys(semestersData).length > 0 && !selectedYear && !selectedSemester) {
      const sortedYears = Object.keys(semestersData).sort((a, b) => parseInt(b) - parseInt(a));
      const firstYear = sortedYears[0];
      if (firstYear) {
        const sortedSemesters = semestersData[firstYear].sort(
          (a, b) => parseInt(a.tcd.slice(4)) - parseInt(b.tcd.slice(4))
        );
        const firstSemester = sortedSemesters[0];
        setSelectedYear(firstYear);
        setSelectedSemester(firstSemester);
      }
    }
  }, [semestersData, selectedYear, selectedSemester]);

  useEffect(() => {
    if (selectedSemester) {
      const fetchAndGroupXML = async () => {
        try {
          const semester = selectedSemester.tcd;
          await fetchDepartmentData({ semester, setGroupedData, setLoading });
        } catch (err) {
          setError((err as Error).message);
          setLoading(false);
        }
      };
      fetchAndGroupXML();
    }
  }, [selectedSemester]);

  useEffect(() => {
    if (selectedDepartment && selectedSemester) {
      const fetchAndGroupXML = async () => {
        try {
          const code = selectedDepartment.tcd;
          const semester = selectedSemester.tcd;
          await fetchSubjectsData({ code, semester, setSubjectsData, setLoading });
        } catch (err) {
          setError((err as Error).message);
          setLoading(false);
        }
      };
      fetchAndGroupXML();
    }
  }, [selectedDepartment, selectedSemester]);

  // 학과 검색 결과 업데이트
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results: DepartmentSearchResult[] = [];

    Object.entries(groupedData).forEach(([university, faculties]) => {
      Object.entries(faculties).forEach(([faculty, departments]) => {
        departments.forEach((dept) => {
          if (dept.tnm.toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push({
              ...dept,
              university,
              faculty,
            });
          }
        });
      });
    });

    setSearchResults(results);
  }, [searchTerm, groupedData]);

  // 학과 검색 결과 선택 핸들러
  const handleSearchSelect = (result: DepartmentSearchResult) => {
    setSelectedUniversity(result.university);
    setSelectedFaculty(result.faculty);
    setSelectedDepartment(result);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleUniversityClick = (university: string) => {
    setSelectedUniversity(university);
    setSelectedFaculty(null); // 대학을 선택하면 학부 초기화
    setSelectedDepartment(null); // 학과 선택 초기화
  };

  const handleFacultyClick = (faculty: string) => {
    setSelectedFaculty(faculty);
    setSelectedDepartment(null); // 학과 선택 초기화
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedSemester(null); // 년도 변경 시 학기 초기화
    // 선택된 대학, 학부, 학과도 초기화
    setSelectedUniversity(null);
    setSelectedFaculty(null);
    setSelectedDepartment(null);
    setGroupedData({}); // groupedData도 초기화
  };

  const handleSemesterChange = (semester: Semester) => {
    setSelectedSemester(semester);
    // 선택된 대학, 학부, 학과도 초기화
    setSelectedUniversity(null);
    setSelectedFaculty(null);
    setSelectedDepartment(null);
    setGroupedData({}); // groupedData도 초기화
  };

  if (loading) {
    return <div className="text-center mt-10 text-xl">로딩 중...</div>;
  }

  if (error) {
    // 에러 메시지를 안전하게 렌더링
    const sanitizedError = error.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return <div className="text-center mt-10 text-xl text-red-500">오류: {sanitizedError}</div>;
  }

  return (
    <div className="font-sans p-6 max-w-4xl mx-auto">
      <div className="mb-6 grid grid-cols-3 gap-4">
        {/* 년도 선택 */}
        <div className="space-y-2">
          <Label htmlFor="year-select">년도 선택</Label>
          <Select value={selectedYear || ''} onValueChange={(value) => handleYearChange(value)}>
            <SelectTrigger id="year-select" className="bg-white">
              <SelectValue placeholder="년도 선택" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-lg z-50">
              {Object.keys(semestersData)
                .sort((a, b) => Number.parseInt(b) - Number.parseInt(a)) // 내림차순 정렬
                .map((year) => (
                  <SelectItem key={year} value={year} className="py-1 z-50">
                    {year}년
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* 학기 선택 */}
        <div className="space-y-2">
          <Label htmlFor="semester-select">학기 선택</Label>
          <Select
            value={selectedSemester?.tcd || ''}
            onValueChange={(value) => {
              const semester = semestersData[selectedYear!]?.find((s) => s.tcd === value);
              if (semester) {
                handleSemesterChange(semester);
              }
            }}
            disabled={!selectedYear}
          >
            <SelectTrigger id="semester-select" className="bg-white">
              <SelectValue placeholder="학기 선택" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-lg z-50">
              {selectedYear &&
                semestersData[selectedYear].map((semester) => (
                  <SelectItem key={semester.tcd} value={semester.tcd} className="py-1 px-2 z-50">
                    {semester.tnm}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 space-y-2">
          <Label htmlFor="year-select">학과 선택</Label>
          <Popover open={popoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setPopoverOpen((prev) => !prev)}
                className="bg-blue-700 text-white hover:bg-blue-800 hover:text-white"
              >
                {selectedTrack === null ? '선택해주세요' : selectedTrack}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[800px] bg-gray-100 p-6 rounded-xl shadow-xl z-50">
              <div className="mb-6 relative">
                <Input
                  type="text"
                  placeholder="학과 검색..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full bg-white"
                />
                {searchTerm && searchResults.length > 0 && (
                  <div className="absolute mt-2 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
                    {searchResults.map((result) => (
                      <button
                        key={result.tcd}
                        onClick={() => handleSearchSelect(result)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        {result.tnm} ({result.university} - {result.faculty})
                      </button>
                    ))}
                  </div>
                )}
                {searchTerm && searchResults.length === 0 && (
                  <div className="absolute mt-2 w-full bg-white border rounded-md shadow-lg p-4 z-10">
                    검색 결과가 없습니다.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white shadow-md border-none">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">단과대</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="grid grid-cols-1 gap-2">
                        {Object.keys(groupedData).map((university) => (
                          <button
                            key={university}
                            onClick={() => handleUniversityClick(university)}
                            className={`p-3 rounded-lg text-left transition-colors duration-200 ${
                              selectedUniversity === university
                                ? 'bg-blue-700 text-white'
                                : 'bg-gray-100 text-gray-800 hover:bg-blue-700 hover:text-white'
                            }`}
                          >
                            {university}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-md border-none">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      {selectedUniversity ? `${selectedUniversity} 학부 목록` : '학부 목록'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="grid grid-cols-1 gap-2">
                        {selectedUniversity &&
                          groupedData[selectedUniversity] &&
                          Object.keys(groupedData[selectedUniversity]).map((faculty) => (
                            <button
                              key={faculty}
                              onClick={() => handleFacultyClick(faculty)}
                              className={`p-3 rounded-lg text-left transition-colors duration-200 ${
                                selectedFaculty === faculty
                                  ? 'bg-blue-700 text-white'
                                  : 'bg-gray-100 text-gray-800 hover:bg-blue-700 hover:text-white'
                              }`}
                            >
                              {faculty}
                            </button>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-md border-none">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      {selectedFaculty ? `${selectedFaculty} 학과 목록` : '학과 목록'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="grid grid-cols-1 gap-2">
                        {selectedUniversity &&
                          selectedFaculty &&
                          groupedData[selectedUniversity] &&
                          groupedData[selectedUniversity][selectedFaculty] &&
                          groupedData[selectedUniversity][selectedFaculty].map((track) => (
                            <button
                              key={track.tcd}
                              className={`p-3 rounded-lg text-left transition-colors duration-200 ${
                                selectedTrack === track.tnm
                                  ? 'bg-blue-700 text-white'
                                  : 'bg-gray-100 text-gray-800 hover:bg-blue-700 hover:text-white'
                              }`}
                              onClick={() => {
                                handleSearchSelect({
                                  ...track,
                                  university: selectedUniversity,
                                  faculty: selectedFaculty,
                                });
                                setSelectedTrack(track.tnm);
                              }}
                            >
                              {track.tnm}
                            </button>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <SubjectsTable sbjs={subjectsData} />
      </div>
    </div>
  );
};

export default DepartmentSelector;
