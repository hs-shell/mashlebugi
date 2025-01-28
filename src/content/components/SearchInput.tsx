// components/SearchInput.tsx
import React from 'react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchResults: any[]; // 타입을 구체적으로 지정하세요.
  onSelectResult: (result: any) => void; // 타입을 구체적으로 지정하세요.
}

const SearchInput: React.FC<SearchInputProps> = ({ searchTerm, onSearchChange, searchResults, onSelectResult }) => {
  return (
    <div className="mb-6 relative">
      <Input
        type="text"
        placeholder="학과 검색..."
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
        className="w-full"
      />
      {/* 검색 결과 드롭다운 */}
      {searchTerm && (
        <>
          {searchResults.length > 0 ? (
            <div className="absolute mt-2 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
              {searchResults.map((result) => (
                <button
                  key={result.tcd}
                  onClick={() => onSelectResult(result)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  {result.tnm} ({result.university} - {result.faculty})
                </button>
              ))}
            </div>
          ) : (
            <div className="absolute mt-2 w-full bg-white border rounded-md shadow-lg p-4 z-10">
              검색 결과가 없습니다.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchInput;
