import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import AuthModal from '../../components/Auth/AuthModal';

// ── Tests ───────────────────────────────────────────────────────────────────────

describe('AuthModal Component', () => {
  const onClose = vi.fn();
  const onLogin = vi.fn();
  const onRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderModal = () =>
    render(
      <AuthModal
        mainTitle="Test Cafe"
        onClose={onClose}
        onLogin={onLogin}
        onRegister={onRegister}
      />
    );

  it('renders the brand name', () => {
    renderModal();
    expect(screen.getByText('Test Cafe')).toBeInTheDocument();
  });

  it('renders login tab as active by default', () => {
    renderModal();
    expect(screen.getByRole('button', { name: 'MasukSwitch' })).toBeInTheDocument();
    expect(screen.getByText('Daftar')).toBeInTheDocument();
    // Login form has "Masuk" submit button
    expect(screen.getByRole('button', { name: 'MasukButton' })).toBeInTheDocument();
  });

  it('switches to register tab when "Daftar" is clicked', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('Daftar'));

    // Register form should now be visible
    expect(screen.getByText('Buat Akun')).toBeInTheDocument();
  });

  it('switches back to login tab from register', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('Daftar'));
    expect(screen.getByText('Buat Akun')).toBeInTheDocument();

    await user.click(screen.getByText('Masuk'));
    // Should see the login submit button again
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'MasukButton' })).toBeInTheDocument();
    });
  });

});
