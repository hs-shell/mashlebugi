import React, { useState, useEffect } from 'react';
import { Department, SugangInwon } from '@/types/types';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchSugangInwonData } from '@/hooks/fetchAPI';
import { Label } from '@/components/ui/label';
import { Popover } from '@/components/ui/popover';
import { PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { Button } from '@/components/ui/button';
import { loadDataFromStorage } from '@/hooks/storage';
import SugangInwonTable from './SugangInwonTable';

export type ViewType = 'total' | 'master-detail';
interface DepartmentSearchResult extends Department {
  university: string;
  faculty: string;
}

interface GroupedDataProp {
  groupedData: { [college: string]: { [faculty: string]: Department[] } };
}
const DepartmentSelector: React.FC<GroupedDataProp> = (groupedDataProp: GroupedDataProp) => {
  const groupedData = groupedDataProp.groupedData;
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentSearchResult | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<DepartmentSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [sugangInwon, setSugangInwon] = useState<SugangInwon[]>([]);

  const [view, setView] = useState<ViewType>('master-detail');

  useEffect(() => {
    if (!selectedDepartment) return;
    const fetchAndGroupXML = async () => {
      try {
        /**
         * TODO 나중에 동적으로 가져올 것! 🚨
         *
         *
         */

        await fetchSugangInwonData({
          code: selectedDepartment.tcd,
          setSugangInwon: setSugangInwon,
        });
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };
    fetchAndGroupXML();
  }, [selectedDepartment]);

  useEffect(() => {
    if (isInitialized || !groupedData || Object.keys(groupedData).length === 0) return;

    setIsInitialized(true);
    let isDepartmentSelected = false;
    loadDataFromStorage('department', (data: string | null) => {
      if (!data) data = '교양필수';
      Object.entries(groupedData).forEach(([university, faculties]) => {
        Object.entries(faculties).forEach(([faculty, departments]) => {
          departments.forEach((dept) => {
            if (dept.tnm.toLowerCase().includes(data)) {
              setSelectedDepartment({ university: university, faculty: faculty, tcd: dept.tcd, tnm: dept.tnm });
              setSelectedUniversity(university);
              setSelectedFaculty(faculty);
              setSelectedTrack(dept.tnm);
              isDepartmentSelected = true;
            }
          });
        });
      });
    });
    if (!isDepartmentSelected) {
      setLoading(false);
    }
  }, [groupedData, isInitialized]);

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
    setSelectedTrack(result.tnm);
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

  if (loading) {
    return <div className="text-center mt-10 text-xl">로딩 중...</div>;
  }

  if (error) {
    // 에러 메시지를 안전하게 렌더링
    const sanitizedError = error.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return <div className="text-center mt-10 text-xl text-red-500">오류: {sanitizedError}</div>;
  }

  return (
    <div className="m-0 p-0">
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="grid grid-cols-1 space-y-2">
          <Label>학과 선택</Label>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`${selectedTrack === null ? 'bg-white border-zinc-300 text-black hover:bg-zinc-50 hover:text-black shadow-none' : 'bg-blue-700 text-white hover:bg-blue-800 hover:text-white'} `}
              >
                {selectedTrack === null ? '선택해주세요' : selectedTrack}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="relative left-60 w-[800px] bg-zinc-50 p-4 rounded-xl shadow-xl z-50">
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
                        onClick={() => {
                          handleSearchSelect(result);
                          setPopoverOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-zinc-50"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                : 'bg-zinc-100 text-gray-800 hover:bg-blue-700 hover:text-white'
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
                                  : 'bg-zinc-100 text-gray-800 hover:bg-blue-700 hover:text-white'
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
                                  : 'bg-zinc-100 text-gray-800 hover:bg-blue-700 hover:text-white'
                              }`}
                              onClick={() => {
                                handleSearchSelect({
                                  ...track,
                                  university: selectedUniversity,
                                  faculty: selectedFaculty,
                                });
                                setSelectedTrack(track.tnm);
                                setPopoverOpen(false);
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
        <SugangInwonTable sugangs={sugangInwon} />
      </div>
    </div>
  );
};

export default DepartmentSelector;
