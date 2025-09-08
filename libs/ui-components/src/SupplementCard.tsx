import React from 'react';
import type { Supplement } from '@wada-bmad/types';

interface SupplementCardProps {
  supplement: Supplement;
  onSelect?: (supplement: Supplement) => void;
}

export const SupplementCard: React.FC<SupplementCardProps> = ({ supplement, onSelect }) => {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect?.(supplement)}
    >
      <h3 className="text-lg font-semibold text-gray-900">{supplement.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{supplement.brand}</p>
      {supplement.description && (
        <p className="text-sm text-gray-700 mb-3">{supplement.description}</p>
      )}
      <div className="flex flex-wrap gap-1 mb-3">
        {supplement.certifications.map((cert) => (
          <span
            key={cert.id}
            className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
          >
            {cert.name}
          </span>
        ))}
      </div>
      <div className="text-xs text-gray-500">
        Ingredients: {supplement.ingredients.map(i => i.name).join(', ')}
      </div>
    </div>
  );
};