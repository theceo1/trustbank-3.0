export function TrustBankLogo({ className }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24">
        {/* Add your logo SVG path here */}
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    );
  }