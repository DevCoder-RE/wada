import { useEffect, useRef, useState } from 'react';
import Quagga from '@quagga2/quagga2';
import { isValidBarcode, parseBarcode } from '@wada-bmad/utils';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onError: (error: string) => void;
  isScanning: boolean;
  onScanningChange: (scanning: boolean) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onBarcodeDetected,
  onError,
  isScanning,
  onScanningChange,
}) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    if (isScanning && videoRef.current) {
      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: videoRef.current,
            constraints: {
              width: 640,
              height: 480,
              facingMode: 'environment',
            },
          },
          locator: {
            patchSize: 'medium',
            halfSample: true,
          },
          numOfWorkers: 2,
          decoder: {
            readers: [
              'ean_reader',
              'ean_8_reader',
              'code_128_reader',
              'code_39_reader',
              'upc_reader',
              'upc_e_reader',
            ],
          },
          locate: true,
        },
        (err) => {
          if (!isMounted) return;

          if (err) {
            console.error('Quagga initialization failed:', err);
            onError(
              "Failed to initialize camera. Please check permissions and ensure you're using HTTPS."
            );
            onScanningChange(false);
            return;
          }
          Quagga.start();
        }
      );

      Quagga.onDetected(async (result) => {
        if (!isMounted) return;

        const code = result.codeResult.code;
        if (code && isValidBarcode(code)) {
          const parsedCode = parseBarcode(code);

          try {
            if (Quagga && typeof Quagga.stop === 'function') {
              Quagga.stop();
            }
          } catch (error) {
            console.warn('Error stopping Quagga:', error);
          }

          onScanningChange(false);
          onBarcodeDetected(parsedCode);
        }
      });
    }

    return () => {
      isMounted = false;
      try {
        if (Quagga && typeof Quagga.stop === 'function') {
          Quagga.stop();
        }
      } catch (error) {
        console.warn('Error stopping Quagga during cleanup:', error);
      }
    };
  }, [isScanning, onBarcodeDetected, onError, onScanningChange]);

  const startScanning = async () => {
    try {
      // Check if we're in a secure context
      if (!window.isSecureContext) {
        throw new Error('Camera access requires HTTPS');
      }

      // Check if media devices are supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      // Stop the stream as Quagga will handle camera access
      stream.getTracks().forEach((track) => track.stop());

      onScanningChange(true);
    } catch (error) {
      console.error('Camera access error:', error);
      let errorMessage = 'Camera access failed. ';

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage +=
            'Please enable camera permissions in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage +=
            'Camera not supported. Please use a different device.';
        } else if (error.message.includes('HTTPS')) {
          errorMessage += 'Camera access requires a secure connection (HTTPS).';
        } else {
          errorMessage += error.message;
        }
      }

      onError(errorMessage);
    }
  };

  const stopScanning = () => {
    try {
      if (Quagga && typeof Quagga.stop === 'function') {
        Quagga.stop();
      }
    } catch (error) {
      console.warn('Error stopping Quagga:', error);
    }
    onScanningChange(false);
  };

  if (!isScanning) {
    return (
      <div className="space-y-4">
        <div
          className="w-64 h-48 bg-gray-200 rounded-lg mx-auto flex items-center justify-center"
          role="img"
          aria-label="Camera preview area - camera not active"
        >
          <span className="text-gray-500">Camera preview will appear here</span>
        </div>
        <button
          onClick={startScanning}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Start barcode scanning with camera"
        >
          Start Scanning
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        ref={videoRef}
        className="w-full max-w-md mx-auto bg-black rounded-lg overflow-hidden"
        style={{ height: '300px' }}
        role="img"
        aria-label="Live camera feed for barcode scanning"
      />
      <div className="space-y-2">
        <p className="text-sm text-gray-600" id="scan-instruction">
          Point your camera at a barcode
        </p>
        <button
          onClick={stopScanning}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          aria-label="Stop barcode scanning"
        >
          Stop Scanning
        </button>
      </div>
    </div>
  );
};

export default BarcodeScanner;
