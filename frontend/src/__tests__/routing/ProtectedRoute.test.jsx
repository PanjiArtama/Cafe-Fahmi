import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import ProtectedRoute from '../../protectedRoute';
import { jwtDecode } from 'jwt-decode';

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('jwt-decode');

// ── Helpers ────────────────────────────────────────────────────────────────────

const renderWithRoute = (initialPath = '/admin/dashboard') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/admin/login" element={<div data-testid="login-page">Login Page</div>} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <div data-testid="dashboard">Protected Dashboard</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

// ── Tests ───────────────────────────────────────────────────────────────────────

describe('ProtectedRoute (Admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('redirects to /admin/login when no token exists', () => {
    renderWithRoute();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });

  it('redirects to /admin/login when token is not admin', () => {
    localStorage.setItem('token', 'fake-token');
    jwtDecode.mockReturnValue({ isAdmin: false, exp: Math.floor(Date.now() / 1000) + 3600 });

    renderWithRoute();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('redirects to /admin/login when token is expired', () => {
    localStorage.setItem('token', 'fake-token');
    // First call: isAdmin check. Second call: exp check.
    jwtDecode
      .mockReturnValueOnce({ isAdmin: true })
      .mockReturnValueOnce({ exp: Math.floor(Date.now() / 1000) - 100 }); // expired

    renderWithRoute();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('renders children when token is valid and admin', () => {
    localStorage.setItem('token', 'valid-admin-token');
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    jwtDecode.mockReturnValue({ isAdmin: true, exp: futureExp });

    renderWithRoute();
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    expect(screen.getByText('Protected Dashboard')).toBeInTheDocument();
  });

  it('renders children when jwtDecode throws (catch block)', () => {
    localStorage.setItem('token', 'valid-admin-token');
    jwtDecode
      .mockReturnValueOnce({ isAdmin: true })
      .mockImplementationOnce(() => { throw new Error('decode error'); });

    renderWithRoute();
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });
});
