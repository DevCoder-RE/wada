import React, { useRef, useEffect, useState } from 'react';
import Quagga from '@quagga2/quagga2';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
  onStop?: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onError, onStop }) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isScanning && scannerRef.current) {
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment"
          },
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: 2,
        decoder: {
          readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader", "upc_e_reader"]
        },
        locate: true
      }, (err) => {
        if (err) {
          console.error('Quagga initialization failed:', err);
          if (onError) {
            onError('Failed to initialize camera. Please check permissions.');
          }
          return;
        }
        Quagga.start();
      });

      Quagga.onDetected((result) => {
        const code = result.codeResult.code;
        if (code) {
          onScan(code);
          stopScanning();
        }
      });
    }

    return () => {
      if (Quagga) {
        Quagga.stop();
      }
    };
  }, [isScanning, onScan, onError]);

  const startScanning = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setIsScanning(true);
    } catch (error) {
      if (onError) {
        onError('Camera access denied. Please enable camera permissions.');
      }
    }
  };

  const stopScanning = () => {
    if (Quagga) {
      Quagga.stop();
    }
    setIsScanning(false);
    if (onStop) {
      onStop();
    }
  };

  if (!isScanning) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="w-64 h-48 bg-gray-200 rounded-lg mx-auto flex items-center justify-center mb-4">
          <span className="text-gray-500">Camera preview will appear here</span>
        </div>
        <button
          onClick={startScanning}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <span className="mr-2">📱</span>
          Start Scanning
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        ref={scannerRef}
        className="w-full bg-black rounded-lg overflow-hidden"
        style={{ height: '300px' }}
      />
      <div className="text-center mt-4 space-y-2">
        <p className="text-sm text-gray-600">
          Point your camera at a barcode
        </p>
        <button
          onClick={stopScanning}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Stop Scanning
        </button>
      </div>
    </div>
  );
};