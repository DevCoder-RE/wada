import { useState } from 'react';

interface AddEntryFormProps {
  onSubmit: (amount: number, unit: string, notes?: string) => void;
  onCancel: () => void;
}

const AddEntryForm: React.FC<AddEntryFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    unit: 'mg',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) {
      alert('Please enter an amount');
      return;
    }

    onSubmit(
      parseFloat(formData.amount),
      formData.unit,
      formData.notes || undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
  );
};

export default AddEntryForm;
