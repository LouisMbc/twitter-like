import React from 'react';

export default function SimpleSpinner() {
  return (
    <div className="flex justify-center py-4">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
}