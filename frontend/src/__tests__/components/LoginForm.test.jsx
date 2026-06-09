import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import LoginForm from '../../components/Auth/LoginForm';

describe('LoginForm Component', () => {
  const onSubmit = vi.fn();
  const onSwitch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = () => render(<LoginForm onSubmit={onSubmit} onSwitch={onSwitch} />);

  it('renders email and password fields with correct labels', () => {
    renderForm();

    expect(screen.getByPlaceholderText('kamu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renders submit button with text "Masuk"', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'MasukButton' })).toBeInTheDocument();
  });

  it('shows validation error when fields are empty', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'MasukButton' }));

    expect(screen.getByText('Mohon isi semua kolom.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when only email is filled', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByPlaceholderText('kamu@email.com'), 'test@test.com');
    await user.click(screen.getByRole('button', { name: 'MasukButton' }));

    expect(screen.getByText('Mohon isi semua kolom.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with credentials when both fields are filled', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByPlaceholderText('kamu@email.com'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: 'MasukButton' }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123'
    });
  });

  it('calls onSwitch when "Daftar sekarang" link is clicked', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByText('Daftar sekarang'));
    expect(onSwitch).toHaveBeenCalledTimes(1);
  });
});
