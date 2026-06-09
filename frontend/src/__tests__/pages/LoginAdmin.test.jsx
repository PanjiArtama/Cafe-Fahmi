import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LoginAdmin from '../../page/LoginAdmin';
import { loginAdmin } from '../../data/auth';
import Swal from 'sweetalert2';
import * as cafeData from '../../data/cafeData';

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../../data/auth');
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));
vi.mock('../../data/cafeData');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── Tests ───────────────────────────────────────────────────────────────────────

describe('LoginAdmin Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    cafeData.getPublicWebInformation.mockResolvedValue({ mainTitle: 'Admin Cafe' });
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <LoginAdmin />
      </BrowserRouter>
    );

  // ── Rendering ──

  it('renders the heading and form elements', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Admin Portal' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Admin')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In to Dashboard' })).toBeInTheDocument();
  });

  it('fetches and displays the cafe title', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Admin Cafe')).toBeInTheDocument();
    });
    expect(cafeData.getPublicWebInformation).toHaveBeenCalledTimes(1);
  });

  it('shows default title before fetch resolves', () => {
    cafeData.getPublicWebInformation.mockReturnValue(new Promise(() => {})); // never resolves
    renderPage();

    expect(screen.getByText('Title Caffe')).toBeInTheDocument();
  });

  // ── Form interaction ──

  it('updates form fields when the user types', async () => {
    const user = userEvent.setup();
    renderPage();

    const usernameInput = screen.getByPlaceholderText('Admin');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    await user.type(usernameInput, 'myadmin');
    await user.type(passwordInput, 'secret');

    expect(usernameInput).toHaveValue('myadmin');
    expect(passwordInput).toHaveValue('secret');
  });

  // ── Successful login ──

  it('stores token, clears storage, and navigates on success', async () => {
    const user = userEvent.setup();

    loginAdmin.mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'jwt-token-123' })
    });

    renderPage();

    await user.type(screen.getByPlaceholderText('Admin'), 'admin');
    await user.type(screen.getByPlaceholderText('••••••••'), 'pass');
    await user.click(screen.getByRole('button', { name: 'Sign In to Dashboard' }));

    await waitFor(() => {
      expect(loginAdmin).toHaveBeenCalledWith({ username: 'admin', password: 'pass' });
      expect(localStorage.getItem('token')).toBe('jwt-token-123');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  // ── Failed login ──

  it('shows SweetAlert warning on failed credentials', async () => {
    const user = userEvent.setup();

    loginAdmin.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' })
    });

    renderPage();

    await user.type(screen.getByPlaceholderText('Admin'), 'bad');
    await user.type(screen.getByPlaceholderText('••••••••'), 'bad');
    await user.click(screen.getByRole('button', { name: 'Sign In to Dashboard' }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'warning',
          title: 'Login Failed',
          text: 'Invalid credentials'
        })
      );
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows generic SweetAlert message when API returns no message', async () => {
    const user = userEvent.setup();

    loginAdmin.mockResolvedValue({
      ok: false,
      json: async () => ({})
    });

    renderPage();

    await user.type(screen.getByPlaceholderText('Admin'), 'x');
    await user.type(screen.getByPlaceholderText('••••••••'), 'x');
    await user.click(screen.getByRole('button', { name: 'Sign In to Dashboard' }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Something went wrong.'
        })
      );
    });
  });

  // ── Network error ──

  it('handles network / fetch errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    loginAdmin.mockRejectedValue(new Error('Network failure'));

    renderPage();

    await user.type(screen.getByPlaceholderText('Admin'), 'a');
    await user.type(screen.getByPlaceholderText('••••••••'), 'b');
    await user.click(screen.getByRole('button', { name: 'Sign In to Dashboard' }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Login error:', expect.any(Error));
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
