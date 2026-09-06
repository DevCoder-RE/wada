import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

jest.mock('@wada-bmad/api-client', () => ({
  AuthService: {
    getCurrentUser: jest.fn().mockResolvedValue(null),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

test('renders the sign-in screen when unauthenticated', async () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  expect(
    await screen.findByRole('heading', { name: 'Sign in to your account' })
  ).toBeInTheDocument();
});