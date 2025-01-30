import React from 'react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchResults: any[];
  onSelectResult: (result: any) => void;
  onClose: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchTerm,
  onSearchChange,
  searchResults,
  onSelectResult,
  onClose,
}) => {
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
                  onClick={() => {
                    onSelectResult(result);
                    onClose();
                  }}
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
