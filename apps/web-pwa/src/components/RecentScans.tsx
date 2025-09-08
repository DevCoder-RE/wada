interface RecentScansProps {
  lastScanned: string | null;
}

const RecentScans: React.FC<RecentScansProps> = ({ lastScanned }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Scans</h3>
      {lastScanned ? (
        <div className="text-sm text-gray-600">
          Last scanned: <span className="font-mono">{lastScanned}</span>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No recent scans</p>
      )}
    </div>
  );
};

export default RecentScans;
