// components/Error.tsx
import React from 'react';

interface ErrorProps {
  message: string;
}

const Error: React.FC<ErrorProps> = ({ message }) => {
  const sanitizedError = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return <div className="text-center mt-10 text-xl text-red-500">오류: {sanitizedError}</div>;
};

export default Error;
