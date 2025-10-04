import React from 'react';
import type { AffiliateLink } from '@wada-bmad/types';

interface AffiliateLinkProps {
  affiliateLink: AffiliateLink;
  onClick?: (affiliateLinkId: string) => void;
  variant?: 'card' | 'inline' | 'button';
  showDisclosure?: boolean;
  className?: string;
}

export const AffiliateLink: React.FC<AffiliateLinkProps> = ({
  affiliateLink,
  onClick,
  variant = 'card',
  showDisclosure = true,
  className = '',
}) => {
  const handleClick = () => {
    onClick?.(affiliateLink.id);
    // Open link in new tab
    window.open(affiliateLink.url, '_blank', 'noopener,noreferrer');
  };

  const renderCardVariant = () => (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">
            {affiliateLink.name}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            {affiliateLink.partner_name}
          </p>
          {affiliateLink.description && (
            <p className="text-sm text-gray-500 mb-2">
              {affiliateLink.description}
            </p>
          )}
        </div>
        <div className="text-blue-600 ml-3 flex-shrink-0">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          <span>Commission: {affiliateLink.commission_rate}%</span>
          {affiliateLink.click_count > 0 && (
            <span>Clicks: {affiliateLink.click_count}</span>
          )}
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            affiliateLink.status === 'active'
              ? 'bg-green-100 text-green-800'
              : affiliateLink.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {affiliateLink.status}
        </div>
      </div>

      {showDisclosure && affiliateLink.disclosure_text && (
        <div className="mt-3 text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
          ⚠️ {affiliateLink.disclosure_text}
        </div>
      )}
    </div>
  );

  const renderInlineVariant = () => (
    <span
      className={`inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 cursor-pointer underline ${className}`}
      onClick={handleClick}
    >
      <span>{affiliateLink.name}</span>
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );

  const renderButtonVariant = () => (
    <button
      onClick={handleClick}
      className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors ${className}`}
    >
      <span className="mr-2">{affiliateLink.name}</span>
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );

  switch (variant) {
    case 'inline':
      return renderInlineVariant();
    case 'button':
      return renderButtonVariant();
    default:
      return renderCardVariant();
  }
};

// Affiliate Link List Component
interface AffiliateLinkListProps {
  affiliateLinks: AffiliateLink[];
  onLinkClick?: (affiliateLinkId: string) => void;
  title?: string;
  showDisclosure?: boolean;
  className?: string;
}

export const AffiliateLinkList: React.FC<AffiliateLinkListProps> = ({
  affiliateLinks,
  onLinkClick,
  title = 'Recommended Resources',
  showDisclosure = true,
  className = '',
}) => {
  if (affiliateLinks.length === 0) return null;

  return (
    <div
      className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      {showDisclosure && (
        <div className="text-sm text-yellow-800 mb-4">
          ⚠️ Affiliate Disclosure: Some links may earn us a commission at no
          extra cost to you.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {affiliateLinks.map((link) => (
          <AffiliateLink
            key={link.id}
            affiliateLink={link}
            onClick={onLinkClick}
            variant="card"
            showDisclosure={false}
          />
        ))}
      </div>
    </div>
  );
};
