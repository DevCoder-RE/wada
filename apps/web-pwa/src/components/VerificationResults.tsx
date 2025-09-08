import type { Certification } from '@wada-bmad/types';

interface VerificationResult {
  verified: boolean;
  certifications: Certification[];
  supplement?: { name: string; brand: string; description?: string };
  cached: boolean;
  loading: boolean;
  error?: string;
}

interface VerificationResultsProps {
  verificationResult: VerificationResult | null;
}

const VerificationResults: React.FC<VerificationResultsProps> = ({
  verificationResult,
}) => {
  if (!verificationResult) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Verification Results
      </h3>

      {verificationResult.loading && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">
            Verifying with certification databases...
          </span>
        </div>
      )}

      {!verificationResult.loading && (
        <>
          <div
            className={`mb-4 p-4 rounded-md ${
              verificationResult.verified
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center">
              <span
                className={`text-lg mr-2 ${
                  verificationResult.verified
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {verificationResult.verified ? '✓' : '✗'}
              </span>
              <div>
                <h4
                  className={`font-medium ${
                    verificationResult.verified
                      ? 'text-green-900'
                      : 'text-red-900'
                  }`}
                >
                  {verificationResult.verified
                    ? 'Certified Supplement'
                    : 'Not Certified'}
                </h4>
                <p
                  className={`text-sm ${
                    verificationResult.verified
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}
                >
                  {verificationResult.cached
                    ? 'Results from cache'
                    : 'Real-time verification'}
                </p>
              </div>
            </div>
          </div>

          {verificationResult.certifications.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">
                Certifications:
              </h5>
              <div className="space-y-2">
                {verificationResult.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {cert.name}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        by {cert.issuer}
                      </span>
                    </div>
                    {cert.valid_until && (
                      <span className="text-xs text-gray-500">
                        Valid until {cert.valid_until.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {verificationResult.error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                Verification error: {verificationResult.error}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VerificationResults;
