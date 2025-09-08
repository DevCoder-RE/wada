import React from 'react';
import type { LogbookEntry, Supplement } from '@wada-bmad/types';

interface LogEntryProps {
  entry: LogbookEntry;
  supplement?: Supplement;
}

export const LogEntry: React.FC<LogEntryProps> = ({ entry, supplement }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-md font-medium text-gray-900">
          {supplement?.name || 'Unknown Supplement'}
        </h4>
        <span className={`text-xs px-2 py-1 rounded ${
          entry.verified
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {entry.verified ? 'Verified' : 'Pending'}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">
        Amount: {entry.amount} {entry.unit}
      </p>
      <p className="text-xs text-gray-500 mb-2">
        {formatDate(entry.timestamp)}
      </p>
      {entry.notes && (
        <p className="text-sm text-gray-700">{entry.notes}</p>
      )}
    </div>
  );
};