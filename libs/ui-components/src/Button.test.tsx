import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  test('renders children correctly', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies correct variant classes', () => {
    const { rerender } = render(<Button onClick={() => {}} variant="primary">Button</Button>);
    expect(screen.getByText('Button')).toHaveClass('bg-blue-600');

    rerender(<Button onClick={() => {}} variant="secondary">Button</Button>);
    expect(screen.getByText('Button')).toHaveClass('bg-gray-200');

    rerender(<Button onClick={() => {}} variant="danger">Button</Button>);
    expect(screen.getByText('Button')).toHaveClass('bg-red-600');
  });

  test('applies disabled state correctly', () => {
    render(<Button onClick={() => {}} disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });
});