import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@wada-bmad/ui-components';

const Education: React.FC = () => {
  const topics = [
    {
      title: 'WADA Prohibited Substances',
      content: 'Learn about substances banned by the World Anti-Doping Agency. Always check the latest list before using supplements.',
      link: 'https://www.wada-ama.org/en/prohibited-list'
    },
    {
      title: 'Supplement Certification',
      content: 'Understand NSF, Informed Sport, and other certifications that ensure supplement safety and purity.',
      details: 'NSF Certified for Sport® and Informed Sport provide third-party testing to verify supplement contents.'
    },
    {
      title: 'Safe Supplementation Practices',
      content: 'Best practices for athletes: consult professionals, track intake, and verify product authenticity.',
      tips: [
        'Consult with a sports dietitian or physician',
        'Use only certified supplements',
        'Keep detailed records of all supplements',
        'Report any adverse effects immediately'
      ]
    },
    {
      title: 'Testing Protocols',
      content: 'Understanding doping control procedures and how to prepare for testing.',
      details: 'Athletes should be aware of their rights and responsibilities during testing.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Athlete Education</h1>
        <p className="text-gray-600 mt-2">Stay informed about supplement safety and WADA compliance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {topics.map((topic, index) => (
          <Card key={index}>
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
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Learn More →
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Safety Check</CardTitle>
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