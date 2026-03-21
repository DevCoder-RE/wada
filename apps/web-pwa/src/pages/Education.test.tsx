import { render, screen, waitFor } from '@testing-library/react';
import Education from './Education';
import { useContentManagement } from '../hooks/useContentManagement';
import type { EducationalContent } from '@wada-bmad/types';

jest.mock('../hooks/useContentManagement');

const mockUseContentManagement = useContentManagement as jest.MockedFunction<
  typeof useContentManagement
>;

const mockContent: EducationalContent[] = [
  {
    id: 'content-1',
    title: 'Understanding WADA Prohibited List',
    slug: 'understanding-wada-prohibited-list',
    description:
      'Learn about substances banned by WADA and how to stay compliant.',
    content_type: 'article',
    content: 'Full article content here...',
    author_id: 'author-1',
    status: 'published',
    published_at: new Date('2024-01-15'),
    category: 'Compliance',
    is_featured: true,
    view_count: 150,
    like_count: 25,
    share_count: 10,
    created_at: new Date('2024-01-10'),
    updated_at: new Date('2024-01-15'),
  },
  {
    id: 'content-2',
    title: 'Supplement Safety 101',
    slug: 'supplement-safety-101',
    description: 'A beginner guide to choosing safe supplements.',
    content_type: 'video',
    media_url: 'https://example.com/video.mp4',
    thumbnail_url: 'https://example.com/thumbnail.jpg',
    author_id: 'author-2',
    status: 'published',
    published_at: new Date('2024-01-12'),
    category: 'Safety',
    reading_time_minutes: 5,
    difficulty_level: 'beginner',
    is_featured: false,
    view_count: 320,
    like_count: 45,
    share_count: 20,
    created_at: new Date('2024-01-08'),
    updated_at: new Date('2024-01-12'),
  },
  {
    id: 'content-3',
    title: 'Certification Explained',
    slug: 'certification-explained',
    description: 'What do NSF, Informed Sport certifications mean?',
    content_type: 'infographic',
    thumbnail_url: 'https://example.com/infographic.jpg',
    author_id: 'author-1',
    status: 'published',
    published_at: new Date('2024-01-10'),
    category: 'Education',
    is_featured: false,
    view_count: 89,
    like_count: 12,
    share_count: 5,
    created_at: new Date('2024-01-05'),
    updated_at: new Date('2024-01-10'),
  },
];

describe('Education', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultMockReturn = {
    content: [],
    categories: [],
    affiliateLinks: [],
    loading: false,
    error: null,
    loadContent: jest.fn(),
    loadCategories: jest.fn(),
    loadAffiliateLinks: jest.fn(),
    trackAffiliateClick: jest.fn(),
  };

  it('renders loading state when content is loading', () => {
    mockUseContentManagement.mockReturnValue({
      ...defaultMockReturn,
      loading: true,
    });

    render(<Education />);

    expect(screen.getByText('Athlete Education')).toBeInTheDocument();
    expect(screen.getByText(/Stay informed/)).toBeInTheDocument();
    const skeletonElements = screen.getAllByRole('generic');
    expect(
      skeletonElements.some((el) => el.className.includes('animate-pulse'))
    ).toBe(true);
  });

  it('renders error state with retry button', async () => {
    mockUseContentManagement.mockReturnValue({
      ...defaultMockReturn,
      error: 'Failed to load content',
      loadContent: jest.fn(),
    });

    render(<Education />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load content/)).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Try again');
    expect(retryButton).toBeInTheDocument();
  });

  it('renders dynamic content when available', () => {
    mockUseContentManagement.mockReturnValue({
      ...defaultMockReturn,
      content: mockContent,
    });

    render(<Education />);

    expect(
      screen.getByText('Understanding WADA Prohibited List')
    ).toBeInTheDocument();
    expect(screen.getByText('Supplement Safety 101')).toBeInTheDocument();
    expect(screen.getByText('Certification Explained')).toBeInTheDocument();
  });

  it('renders static topics even when no dynamic content', () => {
    mockUseContentManagement.mockReturnValue({
      ...defaultMockReturn,
      content: [],
    });

    render(<Education />);

    expect(
      screen.getByText('Safe Supplementation Practices')
    ).toBeInTheDocument();
    expect(screen.getByText('Testing Protocols')).toBeInTheDocument();
    expect(screen.getByText('Certification Guide')).toBeInTheDocument();
  });

  it('renders certification guide with certification badges', () => {
    mockUseContentManagement.mockReturnValue({
      ...defaultMockReturn,
      content: [],
    });

    render(<Education />);

    expect(screen.getByText('NSF Certified for Sport')).toBeInTheDocument();
    expect(screen.getByText('Informed Sport')).toBeInTheDocument();
    expect(screen.getByText('WADA Compliant')).toBeInTheDocument();
  });

  it('renders quick safety checklist', () => {
    mockUseContentManagement.mockReturnValue({
      ...defaultMockReturn,
      content: [],
    });

    render(<Education />);

    expect(screen.getByText('Quick Safety Checklist')).toBeInTheDocument();
    expect(
      screen.getByText('Check for certification logos')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Verify batch testing results')
    ).toBeInTheDocument();
    expect(screen.getByText('Scan barcode in this app')).toBeInTheDocument();
    expect(screen.getByText('Log usage in your journal')).toBeInTheDocument();
  });

  it('renders static topic tips as bullet list', () => {
    mockUseContentManagement.mockReturnValue({
      ...defaultMockReturn,
      content: [],
    });

    render(<Education />);

    expect(
      screen.getByText('Consult with a sports dietitian or physician')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Use only certified supplements')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Keep detailed records of all supplements')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Report any adverse effects immediately')
    ).toBeInTheDocument();
  });

  it('renders external links with correct attributes', () => {
    mockUseContentManagement.mockReturnValue({
      ...defaultMockReturn,
      content: [],
    });

    render(<Education />);

    const wadaLink = screen.getByText('Learn More').closest('a');
    expect(wadaLink).toHaveAttribute(
      'href',
      'https://www.wada-ama.org/en/prohibited-list'
    );
    expect(wadaLink).toHaveAttribute('target', '_blank');
    expect(wadaLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('displays content type icons', () => {
    mockUseContentManagement.mockReturnValue({
      ...defaultMockReturn,
      content: mockContent,
    });

    render(<Education />);

    expect(screen.getByText('📄')).toBeInTheDocument();
    expect(screen.getByText('🎬')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  it('displays category badges for content', () => {
    mockUseContentManagement.mockReturnValue({
      ...defaultMockReturn,
      content: mockContent,
    });

    render(<Education />);

    expect(screen.getByText('Compliance')).toBeInTheDocument();
    expect(screen.getByText('Safety')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
  });

  it('displays reading time when available', () => {
    mockUseContentManagement.mockReturnValue({
      ...defaultMockReturn,
      content: mockContent,
    });

    render(<Education />);

    expect(screen.getByText('5 min read')).toBeInTheDocument();
  });

  it('renders content descriptions', () => {
    mockUseContentManagement.mockReturnValue({
      ...defaultMockReturn,
      content: mockContent,
    });

    render(<Education />);

    expect(
      screen.getByText(
        'Learn about substances banned by WADA and how to stay compliant.'
      )
    ).toBeInTheDocument();
  });

  it('renders section headers', () => {
    mockUseContentManagement.mockReturnValue({
      ...defaultMockReturn,
      content: mockContent,
    });

    render(<Education />);

    expect(screen.getByText('Latest Articles & Resources')).toBeInTheDocument();
  });

  it('limits displayed content to 6 items', () => {
    const manyContent = Array.from({ length: 10 }, (_, i) => ({
      ...mockContent[0],
      id: `content-${i}`,
      title: `Article ${i}`,
    }));

    mockUseContentManagement.mockReturnValue({
      ...defaultMockReturn,
      content: manyContent,
    });

    render(<Education />);

    const cards = screen.getAllByText(/Article/);
    expect(cards.length).toBe(6);
  });

  it('renders detailed testing protocols content', () => {
    mockUseContentManagement.mockReturnValue({
      ...defaultMockReturn,
      content: [],
    });

    render(<Education />);

    expect(screen.getByText('Testing Protocols')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Understanding doping control procedures and how to prepare for testing.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Athletes should be aware of their rights and responsibilities during testing.'
      )
    ).toBeInTheDocument();
  });
});
