// components/Footer.tsx
import React from 'react';

interface FooterProps {
  totalLength: number;
  displayedLength: number;
}

const Footer: React.FC<FooterProps> = ({ totalLength, displayedLength }) => {
  return (
    <div className="flex-none p-4 bg-white border-t flex justify-end">
      <p className="text-sm text-gray-600">
        {totalLength}개 중 {displayedLength}개 표시 중
      </p>
    </div>
  );
};

export default Footer;
