import React, { useState } from 'react';
import { SecureLogbookEntry, ComplianceAlert } from '@wada-bmad/api-client';
import { Supplement, Certification } from '@wada-bmad/types';
import { formatDate } from '@wada-bmad/utils';

interface SecureLogbookEntryProps {
  entry: SecureLogbookEntry;
  supplement?: Supplement;
  onEdit?: (entryId: string, updates: Partial<SecureLogbookEntry>) => void;
  onDelete?: (entryId: string) => void;
  onVerify?: (entryId: string, barcode: string) => void;
  isEditable?: boolean;
  showAuditTrail?: boolean;
}

export const SecureLogbookEntryComponent: React.FC<SecureLogbookEntryProps> = ({
  entry,
  supplement,
  onEdit,
  onDelete,
  onVerify,
  isEditable = false,
  showAuditTrail = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: entry.amount.toString(),
    unit: entry.unit,
    notes: entry.notes || '',
  });
  const [showVerificationDetails, setShowVerificationDetails] = useState(false);

  const handleEdit = () => {
    if (isEditing) {
      // Save changes
      const updates = {
        amount: parseFloat(editForm.amount),
        unit: editForm.unit,
        notes: editForm.notes || undefined,
      };
      onEdit?.(entry.id, updates);
    }
    setIsEditing(!isEditing);
  };

  const handleVerify = () => {
    // In a real implementation, this would trigger barcode scanning
    const barcode = prompt('Enter barcode for verification:');
    if (barcode) {
      onVerify?.(entry.id, barcode);
    }
  };

  const getVerificationStatusColor = () => {
    if (!entry.verified) return 'bg-red-100 text-red-800';
    if (
      entry.verification_data?.certifications?.some(
        (cert) => cert.valid_until && cert.valid_until < new Date()
      )
    ) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getVerificationStatusText = () => {
    if (!entry.verified) return 'Unverified';
    if (
      entry.verification_data?.certifications?.some(
        (cert) => cert.valid_until && cert.valid_until < new Date()
      )
    ) {
      return 'Verification Expired';
    }
    return 'Verified';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {supplement?.name || 'Unknown Supplement'}
            </h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVerificationStatusColor()}`}
            >
              {getVerificationStatusText()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {supplement?.brand} • {formatDate(entry.timestamp)}
          </p>
        </div>

        <div className="flex space-x-2">
          {isEditable && (
            <>
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                {isEditing ? 'Save' : 'Edit'}
              </button>
              {!entry.verified && (
                <button
                  onClick={handleVerify}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Verify
                </button>
              )}
              <button
                onClick={() => onDelete?.(entry.id)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Entry Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          {isEditing ? (
            <div className="flex space-x-2 mt-1">
              <input
                type="number"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: e.target.value })
                }
                step="0.01"
                min="0"
                className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <select
                value={editForm.unit}
                onChange={(e) =>
                  setEditForm({ ...editForm, unit: e.target.value })
                }
                className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="capsules">capsules</option>
                <option value="tablets">tablets</option>
              </select>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-900">
              {entry.amount} {entry.unit}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Verification Method
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {entry.verification_data?.verification_method
              ? entry.verification_data.verification_method
                  .replace('_', ' ')
                  .toUpperCase()
              : 'Not Verified'}
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        {isEditing ? (
          <textarea
            value={editForm.notes}
            onChange={(e) =>
              setEditForm({ ...editForm, notes: e.target.value })
            }
            rows={3}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Optional notes about this entry..."
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">
            {entry.notes || 'No notes provided'}
          </p>
        )}
      </div>

      {/* Verification Details */}
      {entry.verified && entry.verification_data && (
        <div className="mb-4">
          <button
            onClick={() => setShowVerificationDetails(!showVerificationDetails)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showVerificationDetails ? 'Hide' : 'Show'} Verification Details
          </button>

          {showVerificationDetails && (
            <div className="mt-3 p-4 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Certifications
              </h4>
              <div className="space-y-2">
                {entry.verification_data.certifications.map(
                  (cert: Certification) => (
                    <div
                      key={cert.id}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {cert.name}
                        </p>
                        <p className="text-xs text-gray-600">{cert.issuer}</p>
                      </div>
                      <div className="text-right">
                        {cert.valid_until && (
                          <p
                            className={`text-xs ${cert.valid_until < new Date() ? 'text-red-600' : 'text-green-600'}`}
                          >
                            Valid until: {formatDate(cert.valid_until)}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Verified on {formatDate(entry.verification_data.verified_at)} by{' '}
                {entry.verification_data.verified_by}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Audit Trail */}
      {showAuditTrail && entry.security_metadata?.audit_trail && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Audit Trail
          </h4>
          <div className="space-y-1">
            {entry.security_metadata.audit_trail.slice(-3).map((audit) => (
              <div key={audit.id} className="text-xs text-gray-600">
                {audit.action.toUpperCase()} by {audit.user_role} on{' '}
                {formatDate(audit.timestamp)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Metadata */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Entry ID: {entry.id.slice(-8)}</span>
          <span>Created: {formatDate(entry.created_at)}</span>
          {entry.updated_at && (
            <span>Updated: {formatDate(entry.updated_at)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

interface ComplianceAlertComponentProps {
  alert: ComplianceAlert;
  onDismiss?: (alertId: string) => void;
}

export const ComplianceAlertComponent: React.FC<
  ComplianceAlertComponentProps
> = ({ alert, onDismiss }) => {
  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'high':
        return '🚨';
      case 'medium':
        return '⚠️';
      case 'low':
        return 'ℹ️';
    }
  };

  return (
    <div className={`p-4 rounded-md border ${getSeverityColor()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-lg">{getSeverityIcon()}</span>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{alert.message}</p>
          <p className="text-xs mt-1">
            {formatDate(alert.created_at)}
            {alert.entry_id && ` • Entry: ${alert.entry_id.slice(-8)}`}
          </p>
        </div>
        {onDismiss && (
          <div className="ml-3 flex-shrink-0">
            <button
              onClick={() => onDismiss(alert.id)}
              className="text-sm font-medium hover:opacity-75"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
