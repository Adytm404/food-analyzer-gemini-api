
import React from 'react';

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ title, children }) => {
  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-3xl min-h-[calc(100vh-4rem)]"> 
      {/* min-h to account for navbar height */}
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6 sm:mb-8 text-center">{title}</h1>
      {children}
    </div>
  );
};
