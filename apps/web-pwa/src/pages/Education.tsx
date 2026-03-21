import React, { useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@wada-bmad/ui-components';
import { useContentManagement } from '../hooks/useContentManagement';

const Education: React.FC = () => {
  const { content, loading, error, loadContent, trackAffiliateClick } =
    useContentManagement({ autoLoad: true });

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const staticTopics = useMemo(
    () => [
      {
        title: 'WADA Prohibited Substances',
        content:
          'Learn about substances banned by the World Anti-Doping Agency. Always check the latest list before using supplements.',
        link: 'https://www.wada-ama.org/en/prohibited-list',
        external: true,
      },
      {
        title: 'Safe Supplementation Practices',
        content:
          'Best practices for athletes: consult professionals, track intake, and verify product authenticity.',
        tips: [
          'Consult with a sports dietitian or physician',
          'Use only certified supplements',
          'Keep detailed records of all supplements',
          'Report any adverse effects immediately',
        ],
      },
      {
        title: 'Testing Protocols',
        content:
          'Understanding doping control procedures and how to prepare for testing.',
        details:
          'Athletes should be aware of their rights and responsibilities during testing.',
      },
    ],
    []
  );

  const handleAffiliateClick = async (linkId: string, contentId?: string) => {
    await trackAffiliateClick(linkId, contentId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Athlete Education
          </h1>
          <p className="text-gray-600 mt-2">
            Stay informed about supplement safety and WADA compliance
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white shadow rounded-lg p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Athlete Education
          </h1>
          <p className="text-gray-600 mt-2">
            Stay informed about supplement safety and WADA compliance
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Failed to load content: {error}</p>
          <button
            onClick={() => loadContent()}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {staticTopics.map((topic, index) => (
            <Card key={`static-${index}`}>
              <CardHeader>
                <CardTitle>{topic.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{topic.content}</p>
                {topic.details && (
                  <p className="text-sm text-gray-600 mb-4">{topic.details}</p>
                )}
                {topic.tips && (
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {topic.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎬';
      case 'article':
        return '📄';
      case 'infographic':
        return '📊';
      case 'course':
        return '📚';
      case 'webinar':
        return '🎥';
      default:
        return '📖';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Athlete Education</h1>
        <p className="text-gray-600 mt-2">
          Stay informed about supplement safety and WADA compliance
        </p>
      </div>

      {content.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Latest Articles & Resources
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {content.slice(0, 6).map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                {item.thumbnail_url && (
                  <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getContentTypeIcon(item.content_type)}
                    </span>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {item.category}
                    </span>
                    {item.reading_time_minutes && (
                      <span>{item.reading_time_minutes} min read</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {staticTopics.map((topic, index) => (
          <Card key={`static-${index}`}>
            <CardHeader>
              <CardTitle>{topic.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{topic.content}</p>
              {topic.details && (
                <p className="text-sm text-gray-600 mb-4">{topic.details}</p>
              )}
              {topic.tips && (
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {topic.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              )}
              {topic.link && (
                <a
                  href={topic.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1 mt-3"
                >
                  Learn More
                  <span aria-hidden="true">→</span>
                </a>
              )}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Certification Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Understand NSF, Informed Sport, and other certifications that
              ensure supplement safety and purity.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">NSF</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    NSF Certified for Sport
                  </h4>
                  <p className="text-sm text-gray-600">
                    Third-party testing for athletes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-xs">IS</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Informed Sport</h4>
                  <p className="text-sm text-gray-600">
                    Banned substance tested
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-xs">
                    WADA
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">WADA Compliant</h4>
                  <p className="text-sm text-gray-600">
                    Meets anti-doping standards
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Safety Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">Before using any supplement:</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Check for certification logos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Verify batch testing results</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Scan barcode in this app</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Log usage in your journal</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Education;
