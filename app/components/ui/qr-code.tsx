import dynamic from 'next/dynamic';
import type { QRCodeSVG } from 'qrcode.react';

const QRCodeReact = dynamic<React.ComponentProps<typeof QRCodeSVG>>(() => 
  import('qrcode.react').then(mod => mod.QRCodeSVG)
, { ssr: false });

interface CustomQRCodeProps {
  value: string;
  size?: number;
}

export function QRCode({ value, size = 128 }: CustomQRCodeProps) {
  return (
    <div className="bg-white p-4 rounded-lg inline-block">
      <QRCodeReact
        value={value}
        size={size}
        level="H"
        includeMargin={true}
      />
    </div>
  );
}