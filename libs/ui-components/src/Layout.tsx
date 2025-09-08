import React from 'react';

interface LayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ header, sidebar, children, footer }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {header && (
        <header className="bg-white shadow-sm border-b">
          {header}
        </header>
      )}
      <div className="flex">
        {sidebar && (
          <aside className="w-64 bg-white shadow-sm border-r">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      {footer && (
        <footer className="bg-white border-t mt-auto">
          {footer}
        </footer>
      )}
    </div>
  );
};