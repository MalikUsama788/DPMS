// src/components/VisitQRCode.js
"use client";
import { useState, useEffect } from 'react';

export default function VisitQRCode({ visitId, size = 80 }) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  // Generate the QR Code URL
  const getQRCodeUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/admin/visits/${visitId}`;
    }
    return `/visit/${visitId}`;
  };

  // Generate QR code
  const generateQRCode = async () => {
    try {
      const QRCode = (await import('qrcode')).default;
      const url = getQRCodeUrl();
      
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      toast.error('Error generating QR code: ', error);
    }
  };
  useEffect(() => {
    generateQRCode();
  }, [visitId, size]);

  // QR Code URL not ready yet
  if (!qrCodeDataUrl) {
    return (
      <div className={`w-${size/8} h-${size/8} bg-gray-200 animate-pulse rounded flex items-center justify-center`}>
        <span className="text-xs text-gray-500">QR Code</span>
      </div>
    );
  }

  return (
    <div>
      <img 
        src={qrCodeDataUrl} 
        alt="QR Code" 
        className="border border-gray-300 rounded"
        style={{ width: size, height: size }}
      />
    </div>
  );
}