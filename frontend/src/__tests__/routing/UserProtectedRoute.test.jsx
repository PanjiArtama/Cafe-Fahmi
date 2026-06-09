import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import UserProtectedRoute from '../../userProtectedRoute';
import { jwtDecode } from 'jwt-decode';

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('jwt-decode');

// ── Helpers ────────────────────────────────────────────────────────────────────

const renderWithRoute = (initialPath = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div data-testid="home-page">Home</div>} />
        <Route
          path="/dashboard"
          element={
            <UserProtectedRoute>
              <div data-testid="user-dashboard">User Dashboard</div>
            </UserProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

// ── Tests ───────────────────────────────────────────────────────────────────────

describe('UserProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('redirects to / when no token exists', () => {
    renderWithRoute();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.queryByTestId('user-dashboard')).not.toBeInTheDocument();
  });

  it('redirects to / when token belongs to an admin', () => {
    localStorage.setItem('token', 'admin-token');
    jwtDecode.mockReturnValue({ isAdmin: true, exp: Math.floor(Date.now() / 1000) + 3600 });

    renderWithRoute();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('redirects to / when user token is expired', () => {
    localStorage.setItem('token', 'user-token');
    jwtDecode
      .mockReturnValueOnce({ isAdmin: false })
      .mockReturnValueOnce({ exp: Math.floor(Date.now() / 1000) - 100 }); // expired

    renderWithRoute();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('renders children when token is valid and non-admin', () => {
    localStorage.setItem('token', 'valid-user-token');
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    jwtDecode.mockReturnValue({ isAdmin: false, exp: futureExp });

    renderWithRoute();
    expect(screen.getByTestId('user-dashboard')).toBeInTheDocument();
    expect(screen.getByText('User Dashboard')).toBeInTheDocument();
  });

  it('renders children when jwtDecode throws (catch block)', () => {
    localStorage.setItem('token', 'valid-user-token');
    jwtDecode
      .mockReturnValueOnce({ isAdmin: false })
      .mockImplementationOnce(() => { throw new Error('decode error'); });

    renderWithRoute();
    expect(screen.getByTestId('user-dashboard')).toBeInTheDocument();
  });
});
