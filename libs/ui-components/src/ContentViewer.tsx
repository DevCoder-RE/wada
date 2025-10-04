import React, { useState, useEffect } from 'react';
import type { EducationalContent, AffiliateLink } from '@wada-bmad/types';

interface ContentViewerProps {
  content: EducationalContent;
  affiliateLinks?: AffiliateLink[];
  onEngagement?: (
    type: 'view' | 'like' | 'share' | 'complete',
    progress?: number
  ) => void;
  onAffiliateClick?: (affiliateLinkId: string) => void;
  className?: string;
}

export const ContentViewer: React.FC<ContentViewerProps> = ({
  content,
  affiliateLinks = [],
  onEngagement,
  onAffiliateClick,
  className = '',
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    // Track view engagement
    onEngagement?.('view');

    // Set up scroll tracking for reading progress
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.offsetHeight - window.innerHeight;
      const progress = Math.min((scrollTop / docHeight) * 100, 100);
      setReadingProgress(progress);

      if (progress >= 90 && content.content_type === 'article') {
        onEngagement?.('complete', progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [content.id, content.content_type, onEngagement]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onEngagement?.('like');
  };

  const handleShare = () => {
    setShowShareModal(true);
    onEngagement?.('share');
  };

  const handleAffiliateClick = (affiliateLink: AffiliateLink) => {
    onAffiliateClick?.(affiliateLink.id);
    window.open(affiliateLink.url, '_blank', 'noopener,noreferrer');
  };

  const renderContent = () => {
    switch (content.content_type) {
      case 'video':
        return (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {content.media_url ? (
              <video
                controls
                className="w-full h-full"
                poster={content.thumbnail_url}
                onEnded={() => onEngagement?.('complete', 100)}
              >
                <source src={content.media_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎥</div>
                  <p>Video content not available</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'infographic':
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            {content.media_url ? (
              <img
                src={content.media_url}
                alt={content.title}
                className="w-full h-auto rounded-lg shadow-lg"
                onLoad={() => onEngagement?.('complete', 100)}
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-600">Infographic not available</p>
              </div>
            )}
          </div>
        );

      case 'course':
        return (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-4">📚</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {content.title}
                </h3>
                <p className="text-gray-600">{content.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Duration</div>
                <div className="text-lg font-semibold">
                  {content.reading_time_minutes} minutes
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Difficulty</div>
                <div className="text-lg font-semibold capitalize">
                  {content.difficulty_level}
                </div>
              </div>
            </div>
          </div>
        );

      case 'webinar':
        return (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-4">🎙️</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {content.title}
                </h3>
                <p className="text-gray-600">{content.description}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-500 mb-2">Webinar Details</div>
              <p className="text-gray-700">{content.content}</p>
            </div>
          </div>
        );

      default: // article
        return (
          <div className="prose prose-lg max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: content.content || '' }}
              className="text-gray-800 leading-relaxed"
            />
          </div>
        );
    }
  };

  const renderAffiliateLinks = () => {
    if (affiliateLinks.length === 0) return null;

    return (
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recommended Resources
        </h3>
        <div className="text-sm text-yellow-800 mb-4">
          ⚠️ Affiliate Disclosure: Some links may earn us a commission at no
          extra cost to you.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {affiliateLinks.map((link) => (
            <div
              key={link.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleAffiliateClick(link)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {link.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {link.partner_name}
                  </p>
                  <div className="text-xs text-gray-500">
                    Commission: {link.commission_rate}%
                  </div>
                </div>
                <div className="text-blue-600 ml-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              content.status === 'published'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {content.status}
          </span>
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
            {content.content_type}
          </span>
          {content.is_featured && (
            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
              Featured
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {content.title}
        </h1>

        {content.description && (
          <p className="text-lg text-gray-600 mb-4">{content.description}</p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>By {content.author?.email || 'Anonymous'}</span>
            <span>{content.reading_time_minutes} min read</span>
            <span>{content.difficulty_level}</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{content.view_count}</span>
            </div>

            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{content.like_count}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Progress Bar */}
      {content.content_type === 'article' && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-right">
            {Math.round(readingProgress)}% complete
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mb-8">{renderContent()}</div>

      {/* Engagement Actions */}
      <div className="flex items-center justify-between py-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isLiked
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            <span>Share</span>
          </button>
        </div>

        <div className="text-sm text-gray-500">
          Published{' '}
          {new Date(
            content.published_at || content.created_at
          ).toLocaleDateString()}
        </div>
      </div>

      {/* Affiliate Links */}
      {renderAffiliateLinks()}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Share this content</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setShowShareModal(false);
                }}
                className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Copy Link</span>
              </button>

              <button
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.title)}&url=${encodeURIComponent(window.location.href)}`,
                    '_blank'
                  );
                  setShowShareModal(false);
                }}
                className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                <span>Share on Twitter</span>
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
