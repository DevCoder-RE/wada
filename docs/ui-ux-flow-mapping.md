# Apex Performance MVP UI/UX Flow Mapping Document

## Document Overview

This document provides comprehensive UI/UX flow mapping for the Apex Performance MVP, detailing complete user journeys, navigation patterns, error states, loading states, form validation approaches, and component development workflow. Based on the dual-platform architecture (React Web PWA + Flutter Mobile) with shared Material Design principles.

**Version:** 1.0
**Date:** 2025-09-07
**Author:** Architect Agent

## 1. User Journey Mapping

### 1.1 Primary User Persona: Elite Amateur Athlete

#### Journey 1: First-Time User Onboarding

```
Landing Page → Sign Up → Email Verification → Profile Setup → Dashboard → Scanner Tutorial → First Scan
```

**Key Touchpoints:**

- **Landing Page:** Hero section with value proposition, CTA buttons
- **Sign Up:** Email/password form with social login options
- **Email Verification:** OTP input with resend functionality
- **Profile Setup:** Progressive form (3 steps) for athlete profile
- **Dashboard:** Personalized welcome with quick actions
- **Scanner Tutorial:** Interactive walkthrough of scanning feature
- **First Scan:** Guided experience with success feedback

#### Journey 2: Daily Supplement Tracking

```
Dashboard → Scanner → Verification Results → Logbook Entry → Dashboard Update
```

**Key Touchpoints:**

- **Dashboard:** Recent scans, logbook summary, health insights
- **Scanner:** Camera interface with real-time feedback
- **Verification Results:** Detailed product information with safety rating
- **Logbook Entry:** Quick-add form with smart defaults
- **Dashboard Update:** Real-time sync confirmation

#### Journey 3: Research and Education

```
Dashboard → Education → Article Detail → Affiliate Purchase → Logbook Update
```

**Key Touchpoints:**

- **Education:** Categorized content library with search
- **Article Detail:** Rich content with interactive elements
- **Affiliate Purchase:** Seamless purchase flow with tracking
- **Logbook Update:** Automatic entry creation from purchases

### 1.2 Secondary User Persona: Coach/Parent

#### Journey: Monitoring Athlete Safety

```
Login → Athlete Dashboard → Scan History Review → Safety Alerts → Educational Recommendations
```

**Key Touchpoints:**

- **Athlete Dashboard:** Multi-athlete view with safety metrics
- **Scan History Review:** Detailed history with filtering options
- **Safety Alerts:** Proactive notifications about risky products
- **Educational Recommendations:** Personalized content suggestions

## 2. Navigation Patterns

### 2.1 Bottom Navigation (Mobile-First)

#### Primary Navigation Structure

```
🏠 Dashboard | 📷 Scanner | 📚 Education | 👤 Profile
```

**Navigation Rules:**

- **Persistent:** Bottom nav always visible except during scanning
- **State Preservation:** Maintain scroll position and form state
- **Deep Linking:** Support for direct navigation to any screen
- **Accessibility:** Screen reader support with proper ARIA labels

#### Secondary Navigation

- **Dashboard:** Quick action buttons for common tasks
- **Scanner:** Minimal UI overlay during scanning
- **Education:** Category tabs with horizontal scrolling
- **Profile:** Settings menu with hierarchical organization

### 2.2 Web PWA Navigation

#### Top Navigation Bar

```
Logo | Navigation Links | User Menu | Search
```

**Responsive Breakpoints:**

- **Desktop (>1024px):** Full horizontal navigation
- **Tablet (768-1024px):** Collapsed menu with hamburger
- **Mobile (<768px):** Bottom navigation with overlay menu

#### Breadcrumb Navigation

- **Location Context:** Always show current page hierarchy
- **Quick Navigation:** Clickable breadcrumb segments
- **SEO Friendly:** Proper URL structure for deep linking

### 2.3 Cross-Platform Consistency

#### Shared Navigation Patterns

- **Tab Bar:** Consistent ordering across platforms
- **Search:** Unified search experience with filters
- **Settings:** Hierarchical menu structure
- **Back Navigation:** Platform-specific back button behavior

## 3. Error States and Handling

### 3.1 Network Error States

#### Connection Lost

```
State: Offline indicator with retry options
UI: Toast notification + offline mode toggle
Recovery: Automatic retry on reconnection
Fallback: Cached data with "offline" badges
```

#### API Timeout

```
State: Loading spinner with timeout message
UI: Progress indicator with cancel option
Recovery: Retry with exponential backoff
Fallback: Cached results with timestamp
```

#### Rate Limiting

```
State: Rate limit exceeded message
UI: Countdown timer with upgrade prompt
Recovery: Automatic retry after cooldown
Fallback: Queue requests for later processing
```

### 3.2 Authentication Error States

#### Invalid Credentials

```
State: Login form with error highlighting
UI: Red border on fields + error message below
Recovery: Clear error on input + show/hide password toggle
Validation: Real-time validation feedback
```

#### Session Expired

```
State: Modal overlay with re-authentication
UI: Secure login form in modal
Recovery: Automatic redirect to intended page after login
Fallback: Preserve form data during re-authentication
```

#### Account Locked

```
State: Account locked screen with unlock options
UI: Contact support + password reset links
Recovery: Email verification for unlock
Fallback: Read-only mode for existing data
```

### 3.3 Validation Error States

#### Form Validation

```
State: Field-level error indicators
UI: Red borders + error icons + descriptive messages
Recovery: Clear errors on correction + success indicators
Validation: Client-side + server-side validation
```

#### Business Logic Errors

```
State: Contextual error messages
UI: Inline alerts with action buttons
Recovery: Guided correction steps
Fallback: Alternative input methods
```

## 4. Loading States and Performance

### 4.1 Progressive Loading Patterns

#### Skeleton Screens

```
Dashboard: Card skeletons with shimmer animation
List Views: Item placeholders with loading indicators
Forms: Input field skeletons during data fetching
```

#### Progressive Enhancement

```
Initial: Basic layout with loading spinners
Enhanced: Rich content with smooth transitions
Fallback: Graceful degradation for slow connections
```

### 4.2 Performance Optimization

#### Image Loading

```
Strategy: Lazy loading with blur-to-sharp transition
Fallback: Placeholder images with retry mechanism
Optimization: WebP format with JPEG fallback
```

#### Data Fetching

```
Strategy: Optimistic updates with error rollback
Caching: Service worker caching for offline support
Prefetching: Predict and preload likely next screens
```

### 4.3 Loading State Components

#### Global Loading Indicator

```typescript
// LoadingContext.tsx
interface LoadingState {
  isLoading: boolean;
  message: string;
  progress?: number;
}

// Usage
const { showLoading, hideLoading } = useLoading();
showLoading('Verifying supplement...');
```

#### Component-Level Loading

```typescript
// ScanButton.tsx
const [scanState, setScanState] = useState<'idle' | 'scanning' | 'processing'>('idle');

return (
  <Button
    loading={scanState !== 'idle'}
    loadingText={
      scanState === 'scanning' ? 'Scanning...' :
      scanState === 'processing' ? 'Verifying...' : ''
    }
  >
    Scan Product
  </Button>
);
```

## 5. Form Validation Approaches

### 5.1 Real-Time Validation Strategy

#### Field-Level Validation

```typescript
// Validation rules
const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must contain uppercase, lowercase, and number',
  },
};
```

#### Form-Level Validation

```typescript
// Cross-field validation
const validateForm = (values: FormData) => {
  const errors: Record<string, string> = {};

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (values.age < 13) {
    errors.age = 'Must be 13 or older to create account';
  }

  return errors;
};
```

### 5.2 Validation UI Patterns

#### Error Display Hierarchy

1. **Inline Errors:** Immediate feedback below fields
2. **Toast Notifications:** Non-blocking error messages
3. **Modal Alerts:** Critical validation errors
4. **Status Indicators:** Visual feedback for field states

#### Validation States

```
Empty: Neutral styling
Valid: Green border + checkmark icon
Invalid: Red border + error icon + message
Pending: Yellow border + spinner (async validation)
```

### 5.3 Accessibility Considerations

#### Screen Reader Support

- **ARIA Labels:** Descriptive labels for form fields
- **Error Announcements:** Screen reader error announcements
- **Field Groups:** Proper fieldset and legend usage
- **Focus Management:** Logical tab order and focus trapping

#### Keyboard Navigation

- **Tab Order:** Logical navigation through form fields
- **Enter Key:** Submit forms on Enter
- **Escape Key:** Clear errors or close modals
- **Arrow Keys:** Navigate radio buttons and selects

## 6. Component Development Workflow

### 6.1 Component Architecture

#### Atomic Design System

```
Atoms: Buttons, Inputs, Icons, Typography
Molecules: Form Fields, Cards, Navigation Items
Organisms: Forms, Navigation Bars, Content Sections
Templates: Page Layouts with placeholder content
Pages: Complete pages with real content
```

#### Shared Component Library

```typescript
// libs/ui-components/src/components/Button/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
}) => {
  // Implementation with consistent styling
};
```

### 6.2 State Management Patterns

#### Local Component State

```typescript
// Form component with local state
const SupplementForm = () => {
  const [formData, setFormData] = useState<SupplementFormData>({
    name: '',
    brand: '',
    certification: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
};
```

#### Global State Management

```typescript
// Zustand store for user preferences
interface UserPreferencesState {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
  units: 'metric' | 'imperial';
}

export const useUserPreferences = create<UserPreferencesState>()((set) => ({
  theme: 'light',
  notifications: true,
  language: 'en',
  units: 'metric',

  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),
}));
```

### 6.3 Component Testing Strategy

#### Unit Testing

```typescript
// Button.test.tsx
describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

#### Integration Testing

```typescript
// Form submission flow
describe('SupplementForm', () => {
  it('submits form data successfully', async () => {
    const mockSubmit = jest.fn();
    render(<SupplementForm onSubmit={mockSubmit} />);

    // Fill form
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Test Supplement' }
    });

    // Submit form
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'Test Supplement',
        brand: '',
        certification: null
      });
    });
  });
});
```

### 6.4 Component Documentation

#### Storybook Integration

```typescript
// Button.stories.tsx
import { Button } from './Button';

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger']
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg']
    }
  }
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  variant: 'primary',
  children: 'Primary Button'
};

export const Loading = Template.bind({});
Loading.args = {
  variant: 'primary',
  loading: true,
  children: 'Loading Button'
};
```

#### Component API Documentation

```typescript
/**
 * Button component for user interactions
 *
 * @param variant - Visual style variant
 * @param size - Size of the button
 * @param loading - Shows loading spinner when true
 * @param disabled - Disables button interaction
 * @param onClick - Click handler function
 * @param children - Button content
 *
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   Save Changes
 * </Button>
 */
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}
```

## 7. Responsive Design Patterns

### 7.1 Breakpoint Strategy

#### Mobile-First Approach

```scss
// Mobile styles (default)
.button {
  padding: 12px 16px;
  font-size: 16px;
}

// Tablet styles
@media (min-width: 768px) {
  .button {
    padding: 14px 20px;
    font-size: 18px;
  }
}

// Desktop styles
@media (min-width: 1024px) {
  .button {
    padding: 16px 24px;
    font-size: 20px;
  }
}
```

#### Fluid Typography

```scss
// Responsive font sizes
:root {
  --font-size-sm: clamp(0.875rem, 2vw, 1rem);
  --font-size-md: clamp(1rem, 2.5vw, 1.25rem);
  --font-size-lg: clamp(1.25rem, 3vw, 1.5rem);
}
```

### 7.2 Touch-Friendly Design

#### Touch Target Sizes

- **Minimum:** 44px × 44px for touch targets
- **Preferred:** 48px × 48px for better accessibility
- **Spacing:** 8px minimum between interactive elements

#### Gesture Support

- **Swipe Gestures:** Horizontal swipe for navigation
- **Pull to Refresh:** Dashboard and list views
- **Long Press:** Context menus and secondary actions

## 8. Accessibility Implementation

### 8.1 WCAG 2.1 AA Compliance

#### Color Contrast

- **Normal Text:** 4.5:1 contrast ratio
- **Large Text:** 3:1 contrast ratio
- **UI Components:** 3:1 contrast ratio minimum

#### Keyboard Navigation

- **Focus Indicators:** Visible focus rings on all interactive elements
- **Skip Links:** Skip to main content and navigation
- **Logical Order:** Tab order matches visual layout

#### Screen Reader Support

- **Semantic HTML:** Proper heading hierarchy and landmarks
- **ARIA Labels:** Descriptive labels for complex components
- **Live Regions:** Dynamic content announcements

### 8.2 Motion and Animation

#### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .animation {
    animation: none;
    transition: none;
  }
}
```

#### Animation Guidelines

- **Duration:** 200-300ms for micro-interactions
- **Easing:** Ease-out for entrances, ease-in for exits
- **Purpose:** Enhance UX without causing distraction

## 9. Performance Optimization

### 9.1 Bundle Optimization

#### Code Splitting

```typescript
// Dynamic imports for route-based splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Scanner = lazy(() => import('./pages/Scanner'));

// Component-based splitting
const HeavyComponent = lazy(() => import('./components/HeavyComponent'));
```

#### Tree Shaking

```json
// package.json
{
  "sideEffects": false,
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    }
  }
}
```

### 9.2 Image Optimization

#### Responsive Images

```html
<picture>
  <source media="(min-width: 1024px)" srcset="hero-desktop.webp" />
  <source media="(min-width: 768px)" srcset="hero-tablet.webp" />
  <img src="hero-mobile.webp" alt="Hero image" loading="lazy" />
</picture>
```

#### WebP with Fallbacks

```typescript
// Image component with automatic format selection
const OptimizedImage = ({ src, alt, ...props }) => (
  <picture>
    <source srcSet={`${src}.webp`} type="image/webp" />
    <img src={`${src}.jpg`} alt={alt} loading="lazy" {...props} />
  </picture>
);
```

## 10. Testing and Quality Assurance

### 10.1 Visual Regression Testing

#### Screenshot Comparison

```typescript
// Playwright visual test
test('dashboard layout matches design', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png', {
    threshold: 0.1,
    fullPage: true,
  });
});
```

#### Component Visual Testing

```typescript
// Storybook visual tests
describe('Button Visual Tests', () => {
  it('primary button matches design', async () => {
    const image = await takeScreenshot('Button', 'Primary');
    expect(image).toMatchImageSnapshot();
  });
});
```

### 10.2 Cross-Browser Testing

#### Browser Support Matrix

- **Chrome:** Latest 2 versions
- **Firefox:** Latest 2 versions
- **Safari:** Latest 2 versions
- **Edge:** Latest 2 versions
- **Mobile Safari:** iOS 14+
- **Chrome Mobile:** Android 8+

#### Automated Cross-Browser Testing

```javascript
// GitHub Actions workflow
- name: 'Run cross-browser tests'
  uses: microsoft/playwright-github-action@v1
  with:
    browsers: 'chromium firefox webkit'
    test-results-dir: 'test-results'
```

## Conclusion

This UI/UX flow mapping document provides a comprehensive foundation for the Apex Performance MVP's user experience. The dual-platform approach with shared design system ensures consistency while leveraging platform-specific strengths. Regular iteration and user testing will refine these patterns as the product evolves.

**Implementation Priorities:**

1. Establish component library and design system
2. Implement core navigation and layout patterns
3. Build error handling and loading states
4. Develop form validation framework
5. Set up testing infrastructure

**Next Steps:**

1. Create interactive prototypes for key user journeys
2. Conduct usability testing with target users
3. Refine component library based on real usage
4. Establish design system documentation site</content>
   </xai:function_call
   </xai:function_call name="list">
   <parameter name="path">/mnt/c/Users/ksutton.KSUTTON-LT/Documents/roninent/dev/projects/wada-bmad/docs
