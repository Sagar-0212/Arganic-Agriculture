import React from 'react';

export const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-earth-100 p-4 space-y-4 animate-pulse">
      <div className="w-full h-48 bg-earth-200 rounded-xl" />
      <div className="space-y-2">
        <div className="h-4 bg-earth-200 rounded w-2/3" />
        <div className="h-4 bg-earth-200 rounded w-1/3" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-earth-200 rounded w-1/4" />
        <div className="h-8 bg-earth-200 rounded w-1/3" />
      </div>
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="bg-white p-5 rounded-2xl h-24 border border-earth-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl h-72 border border-earth-100 lg:col-span-2" />
        <div className="bg-white rounded-2xl h-72 border border-earth-100" />
      </div>
    </div>
  );
};
