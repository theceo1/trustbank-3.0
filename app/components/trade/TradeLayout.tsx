import { ReactNode } from 'react';

interface TradeLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export default function TradeLayout({ children, sidebar }: TradeLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          {children}
        </div>
        {sidebar && (
          <div className="lg:w-96">
            {sidebar}
          </div>
        )}
      </div>
    </div>
  );
}