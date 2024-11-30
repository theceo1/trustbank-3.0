import { TrustBankLogo } from '@/app/components/brand/Logo';
import { SecurityBadge } from '@/app/components/ui/security-badge';

export function PaymentFlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container max-w-lg mx-auto px-4 py-6 md:py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <TrustBankLogo className="h-8 w-auto md:h-10" />
          <SecurityBadge />
        </header>

        {/* Main Content */}
        <main className="space-y-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>Secured by TrustBank</p>
          <p className="mt-2">24/7 Support Available</p>
        </footer>
      </div>
    </div>
  );
}