import type { ScanHistoryEntry } from '@wada-bmad/types';

interface RecentScansProps {
  scanHistory?: ScanHistoryEntry[];
  isLoading?: boolean;
}

const RecentScans: React.FC<RecentScansProps> = ({
  scanHistory = [],
  isLoading = false,
}) => {
  const displayedScans = scanHistory.slice(0, 5);

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Scans</h3>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Recent Scans</h3>
        {scanHistory.length > 0 && (
          <span className="text-sm text-gray-500">
            {scanHistory.length} total
          </span>
        )}
      </div>
      {displayedScans.length > 0 ? (
        <div className="space-y-3">
          {displayedScans.map((scan) => (
            <div
              key={scan.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {scan.supplementName ? (
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {scan.supplementName}
                    </span>
                  ) : (
                    <span className="text-sm font-mono text-gray-700">
                      {scan.barcode}
                    </span>
                  )}
                  {scan.verified && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {scan.brand && (
                    <span className="text-xs text-gray-500">{scan.brand}</span>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(scan.scannedAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-gray-400 ml-2">
                {scan.barcode}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No recent scans</p>
      )}
    </div>
  );
};

export default RecentScans;
