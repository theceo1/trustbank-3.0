import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export function TrustBankLogo({ className = '' }: LogoProps) {
  return (
    <div className={className}>
      <Image
        src="/images/logo.svg"
        alt="TrustBank Logo"
        width={120}
        height={40}
        priority
      />
    </div>
  );
}