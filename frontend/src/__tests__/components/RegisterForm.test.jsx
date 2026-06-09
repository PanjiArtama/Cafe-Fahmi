import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import RegisterForm from '../../components/Auth/RegisterForm';

describe('RegisterForm Component', () => {
  const onSubmit = vi.fn();
  const onSwitch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = () => render(<RegisterForm onSubmit={onSubmit} onSwitch={onSwitch} />);

  const fillForm = async (user, overrides = {}) => {
    const defaults = {
      name: 'John Doe',
      email: 'john@test.com',
      phone: '081234567890',
      password: 'secret123',
      confirm: 'secret123'
    };
    const data = { ...defaults, ...overrides };

    await user.type(screen.getByPlaceholderText('Nama kamu'), data.name);
    await user.type(screen.getByPlaceholderText('kamu@email.com'), data.email);
    await user.type(screen.getByPlaceholderText('08xxxxxxxxxx'), data.phone);
    await user.type(screen.getByPlaceholderText('Min. 6 karakter'), data.password);
    await user.type(screen.getByPlaceholderText('Ulangi kata sandi'), data.confirm);

    return data;
  };

  // ── Rendering ──

  it('renders all form fields', () => {
    renderForm();

    expect(screen.getByPlaceholderText('Nama kamu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('kamu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('08xxxxxxxxxx')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min. 6 karakter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ulangi kata sandi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buat AkunButton' })).toBeInTheDocument();
  });

  // ── Validation ──

  it('shows error when fields are empty', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Buat AkunButton' }));

    expect(screen.getByText('Mohon isi semua kolom.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows error when phone contains non-numeric characters', async () => {
    const user = userEvent.setup();
    renderForm();

    await fillForm(user, { phone: 'abc123' });
    await user.click(screen.getByRole('button', { name: 'Buat AkunButton' }));

    expect(screen.getByText('Nomor telepon harus berupa angka.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows error when password is less than 6 characters', async () => {
    const user = userEvent.setup();
    renderForm();

    await fillForm(user, { password: '12345', confirm: '12345' });
    await user.click(screen.getByRole('button', { name: 'Buat AkunButton' }));

    expect(screen.getByText('Kata sandi minimal 6 karakter.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderForm();

    await fillForm(user, { password: 'secret123', confirm: 'different' });
    await user.click(screen.getByRole('button', { name: 'Buat AkunButton' }));

    expect(screen.getByText('Kata sandi tidak cocok.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // ── Successful submit ──

  it('calls onSubmit with correct data when form is valid', async () => {
    const user = userEvent.setup();
    renderForm();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Buat AkunButton' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@test.com',
      phone: '081234567890',
      password: 'secret123'
    });
  });

  // ── Tab switch ──

  it('calls onSwitch when "Masuk di sini" is clicked', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByText('Masuk di sini'));
    expect(onSwitch).toHaveBeenCalledTimes(1);
  });
});
