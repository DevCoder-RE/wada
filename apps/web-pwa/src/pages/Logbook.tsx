import { useEffect, useState } from 'react';
import {
  DatabaseService,
  AuthService,
  RealtimeService,
} from '@wada-bmad/api-client';
import { LogEntry } from '@wada-bmad/ui-components';
import {
  SecureLogbookEntryComponent,
  ComplianceAlertComponent,
} from '../components/SecureLogbookEntry';
import { useSecureLogbook } from '../hooks/useSecureLogbook';
import type { LogbookEntry, Supplement } from '@wada-bmad/types';
import { formatDate } from '@wada-bmad/utils';

const Logbook: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);

  // Use the secure logbook hook
  const {
    entries,
    supplements,
    complianceSummary,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    verifyEntry,
    refreshData,
    clearError,
  } = useSecureLogbook({
    autoLoad: true,
    includeAuditTrail: true,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          // Set up real-time subscription for legacy compatibility
          const unsubscribe = RealtimeService.subscribeToLogbookUpdates(
            user.id,
            (payload) => {
              console.log('Realtime update:', payload);
              // Refresh data on update
              refreshData();
            }
          );

          return unsubscribe;
        }
      } catch (error) {
        console.error('Failed to set up real-time subscription:', error);
      }
    };

    const unsubscribe = loadData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [refreshData]);

  useEffect(() => {
    let filtered = entries;

    if (searchTerm) {
      filtered = filtered.filter((entry) => {
        const supplement = supplements.find((s) => s.id === entry.supplementId);
        return (
          supplement?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (selectedDate) {
      filtered = filtered.filter(
        (entry) => formatDate(entry.timestamp) === selectedDate
      );
    }

    setFilteredEntries(filtered);
  }, [entries, searchTerm, selectedDate, supplements]);

  const handleAddEntry = async (
    entryData: Omit<LogbookEntry, 'id' | 'timestamp'>
  ) => {
    try {
      const user = await AuthService.getCurrentUser();
      if (user) {
        await createEntry({
          ...entryData,
          athleteId: user.id,
        });

        setShowAddForm(false);
        // Data will be updated via the hook
      }
    } catch (error) {
      console.error('Failed to add entry:', error);
      alert('Failed to add entry');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Supplement Logbook</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <span className="mr-2">+</span>
          Add Entry
        </button>
      </div>

      {/* Compliance Summary */}
      {complianceSummary && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Compliance Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {complianceSummary.metrics.total_entries}
              </div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {complianceSummary.metrics.verified_entries}
              </div>
              <div className="text-sm text-gray-600">Verified Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {complianceSummary.metrics.compliance_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Compliance Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {complianceSummary.metrics.unique_supplements}
              </div>
              <div className="text-sm text-gray-600">Unique Supplements</div>
            </div>
          </div>

          {/* Compliance Alerts */}
          {complianceSummary.alerts.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Alerts</h3>
              <div className="space-y-2">
                {complianceSummary.alerts.slice(0, 3).map((alert) => (
                  <ComplianceAlertComponent key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-3 flex-shrink-0">
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700"
            >
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search supplements or notes..."
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Filter by Date
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Add Entry Form */}
      {showAddForm && (
        <AddEntryForm
          supplements={supplements}
          onSubmit={handleAddEntry}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => {
            const supplement = supplements.find(
              (s) => s.id === entry.supplementId
            );
            return (
              <SecureLogbookEntryComponent
                key={entry.id}
                entry={entry}
                supplement={supplement}
                onEdit={updateEntry}
                onDelete={deleteEntry}
                onVerify={verifyEntry}
                isEditable={true}
                showAuditTrail={false}
              />
            );
          })
        ) : (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">
              {entries.length === 0
                ? 'No entries yet. Start by adding your first supplement entry!'
                : 'No entries match your search criteria.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface AddEntryFormProps {
  supplements: Supplement[];
  onSubmit: (entry: Omit<LogbookEntry, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}

const AddEntryForm: React.FC<AddEntryFormProps> = ({
  supplements,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    supplementId: '',
    amount: '',
    unit: 'mg',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplementId || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      athleteId: '', // Will be set in parent
      supplementId: formData.supplementId,
      amount: parseFloat(formData.amount),
      unit: formData.unit,
      notes: formData.notes || undefined,
      verified: false,
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Entry</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="supplement"
            className="block text-sm font-medium text-gray-700"
          >
            Supplement *
          </label>
          <select
            id="supplement"
            value={formData.supplementId}
            onChange={(e) =>
              setFormData({ ...formData, supplementId: e.target.value })
            }
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          >
            <option value="">Select a supplement</option>
            {supplements.map((supplement) => (
              <option key={supplement.id} value={supplement.id}>
                {supplement.name} - {supplement.brand}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Amount *
            </label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              step="0.01"
              min="0"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="unit"
              className="block text-sm font-medium text-gray-700"
            >
              Unit
            </label>
            <select
              id="unit"
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="mg">mg</option>
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="capsules">capsules</option>
              <option value="tablets">tablets</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700"
          >
            Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={3}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Optional notes about this entry..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Entry
          </button>
        </div>
      </form>
    </div>
  );
};

export default Logbook;
