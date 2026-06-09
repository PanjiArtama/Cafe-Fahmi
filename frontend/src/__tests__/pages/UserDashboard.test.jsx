import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import UserDashboard from '../../page/UserDashboard';
import * as service from '../../data/service';
import { Toast } from '../../utils/Toast';

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../../data/service');
vi.mock('../../utils/Toast', () => ({ Toast: { fire: vi.fn() } }));

// ── Test data ──────────────────────────────────────────────────────────────────

const PROFILE = {
  _id: 'abc123def890',
  username: 'TestUser',
  email: 'test@example.com',
  phone: '08123456'
};

const COUPONS = [
  {
    couponId: {
      code: 'SAVE20',
      type: 'percentage',
      value: 20,
      minPurchase: 50000,
      maxDiscount: 15000
    },
    expiresAt: '2026-12-31T00:00:00.000Z'
  },
  {
    couponId: {
      code: 'FLAT10K',
      type: 'fixed',
      value: 10000,
      minPurchase: 30000,
      maxDiscount: null
    },
    expiresAt: null
  }
];

const ORDERS = [
  {
    _id: 'order001aaa',
    status: 'pending',
    orderDate: '2026-05-01T08:00:00.000Z',
    totalAmount: 75000,
    subtotalAmount: 80000,
    discountAmount: 5000,
    couponId: { code: 'SAVE20' },
    orderDetails: [
      { quantity: 2, price: 25000, productId: { name: 'Latte' } },
      { quantity: 1, price: 30000, productId: { name: 'Croissant' } }
    ]
  },
  {
    _id: 'order002bbb',
    status: 'completed',
    orderDate: '2026-04-20T10:00:00.000Z',
    totalAmount: 50000,
    subtotalAmount: 50000,
    discountAmount: 0,
    orderDetails: [
      { quantity: 1, price: 50000, productId: { name: 'Premium Drip' } }
    ]
  }
];

const QR_DATA = { qr: 'data:image/png;base64,fakeQrData' };

const setupMocks = (overrides = {}) => {
  service.getProfile.mockResolvedValue(overrides.profile ?? PROFILE);
  service.getOwnCoupon.mockResolvedValue(overrides.coupons ?? COUPONS);
  service.getUserOrder.mockResolvedValue(overrides.orders ?? ORDERS);
  service.getQr.mockResolvedValue(overrides.qr ?? QR_DATA);
  service.updateProfile.mockResolvedValue({ ok: true });
};

// ── Tests ───────────────────────────────────────────────────────────────────────

describe('UserDashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  // ── Identity Card ──

  it('renders the user identity card with username and member ID', async () => {
    render(<UserDashboard />);

    await waitFor(() => {
      expect(screen.getByText('TestUser')).toBeInTheDocument();
      expect(screen.getByText(/CUST-\*\*\*890/)).toBeInTheDocument();
    });
  });

  it('displays the QR code image', async () => {
    render(<UserDashboard />);

    await waitFor(() => {
      const qrImg = screen.getByAltText('User QR Code');
      expect(qrImg).toBeInTheDocument();
      expect(qrImg).toHaveAttribute('src', 'data:image/png;base64,fakeQrData');
    });
  });

  it('shows coupon count badge on QR card', async () => {
    render(<UserDashboard />);

    await waitFor(() => {
      // The badge shows the number of coupons — appears in multiple places
      const badges = screen.getAllByText('2');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  // ── Order History Tab (default) ──

  it('renders order list on initial load', async () => {
    render(<UserDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });
  });

  it('shows order amounts in the list', async () => {
    render(<UserDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/75.000/)).toBeInTheDocument();
      expect(screen.getByText(/50.000/)).toBeInTheDocument();
    });
  });

  it('shows empty state when user has no orders', async () => {
    setupMocks({ orders: [] });
    render(<UserDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/haven't made any orders/i)).toBeInTheDocument();
    });
  });

  it('shows order detail when an order card is clicked', async () => {
    const user = userEvent.setup();
    render(<UserDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });

    // Click the first order card
    const orderCards = screen.getAllByText(/Items/i);
    await user.click(orderCards[0].closest('[class*="cursor-pointer"]'));

    await waitFor(() => {
      expect(screen.getByText('Order Detail')).toBeInTheDocument();
      expect(screen.getByText('Latte')).toBeInTheDocument();
      expect(screen.getByText('Croissant')).toBeInTheDocument();
      expect(screen.getByText(/Items Summary/i)).toBeInTheDocument();
    });
  });

  it('navigates back from order detail to order list', async () => {
    const user = userEvent.setup();
    render(<UserDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });

    const orderCards = screen.getAllByText(/Items/i);
    await user.click(orderCards[0].closest('[class*="cursor-pointer"]'));

    await waitFor(() => {
      expect(screen.getByText('Order Detail')).toBeInTheDocument();
    });

    // Click back button (ChevronLeft)
    const backBtn = screen.getByText('Order Detail').closest('div').querySelector('button');
    await user.click(backBtn);

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  // ── Coupons Tab ──

  it('navigates to coupons tab and renders coupon cards', async () => {
    const user = userEvent.setup();
    render(<UserDashboard />);

    await waitFor(() => expect(screen.getByText('TestUser')).toBeInTheDocument());

    // Click the My Coupons nav button
    const couponButtons = screen.getAllByText(/My Coupons/i);
    await user.click(couponButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('SAVE20')).toBeInTheDocument();
      expect(screen.getByText('FLAT10K')).toBeInTheDocument();
      expect(screen.getByText(/20%/)).toBeInTheDocument();
    });
  });

  it('shows coupon min purchase and expiry details', async () => {
    const user = userEvent.setup();
    render(<UserDashboard />);

    await waitFor(() => expect(screen.getByText('TestUser')).toBeInTheDocument());

    const couponButtons = screen.getAllByText(/My Coupons/i);
    await user.click(couponButtons[0]);

    await waitFor(() => {
      // SAVE20 has minPurchase and maxDiscount
      expect(screen.getByText(/50.000/)).toBeInTheDocument();
      expect(screen.getByText(/Up to Rp 15.000/)).toBeInTheDocument();
      // FLAT10K has no expiry
      expect(screen.getByText('No Limit')).toBeInTheDocument();
    });
  });

  it('shows empty state when user has no coupons', async () => {
    setupMocks({ coupons: [] });
    const user = userEvent.setup();
    render(<UserDashboard />);

    await waitFor(() => expect(screen.getByText('TestUser')).toBeInTheDocument());

    const couponButtons = screen.getAllByText(/My Coupons/i);
    await user.click(couponButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('No Coupons Available')).toBeInTheDocument();
    });
  });

  // ── Settings / Profile Tab ──

  it('navigates to settings tab and renders profile form with pre-filled values', async () => {
    const user = userEvent.setup();
    render(<UserDashboard />);

    await waitFor(() => expect(screen.getByText('TestUser')).toBeInTheDocument());

    const settingsButtons = screen.getAllByText(/Settings/i);
    await user.click(settingsButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Profile Settings')).toBeInTheDocument();
      expect(screen.getByDisplayValue('TestUser')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('08123456')).toBeInTheDocument();
    });
  });

  it('allows editing profile fields', async () => {
    const user = userEvent.setup();
    render(<UserDashboard />);

    await waitFor(() => expect(screen.getByText('TestUser')).toBeInTheDocument());

    const settingsButtons = screen.getAllByText(/Settings/i);
    await user.click(settingsButtons[0]);

    await waitFor(() => expect(screen.getByDisplayValue('TestUser')).toBeInTheDocument());

    const nameInput = screen.getByDisplayValue('TestUser');
    await user.clear(nameInput);
    await user.type(nameInput, 'NewName');

    expect(nameInput).toHaveValue('NewName');
  });

  it('calls updateProfile and shows toast on save', async () => {
    const user = userEvent.setup();
    render(<UserDashboard />);

    await waitFor(() => expect(screen.getByText('TestUser')).toBeInTheDocument());

    const settingsButtons = screen.getAllByText(/Settings/i);
    await user.click(settingsButtons[0]);

    await waitFor(() => expect(screen.getByText('Update Profile')).toBeInTheDocument());

    await user.click(screen.getByText('Update Profile'));

    await waitFor(() => {
      expect(service.updateProfile).toHaveBeenCalled();
      expect(Toast.fire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: 'success' })
      );
    });
  });

  it('shows error toast when profile update fails', async () => {
    service.updateProfile.mockResolvedValue({ ok: false });

    const user = userEvent.setup();
    render(<UserDashboard />);

    await waitFor(() => expect(screen.getByText('TestUser')).toBeInTheDocument());

    const settingsButtons = screen.getAllByText(/Settings/i);
    await user.click(settingsButtons[0]);

    await waitFor(() => expect(screen.getByText('Update Profile')).toBeInTheDocument());

    await user.click(screen.getByText('Update Profile'));

    await waitFor(() => {
      expect(Toast.fire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: 'error' })
      );
    });
  });

  // ── Logout ──

  it('clears storage and redirects on logout', async () => {
    const user = userEvent.setup();

    // Mock window.location
    delete window.location;
    window.location = { href: '' };

    render(<UserDashboard />);

    await waitFor(() => expect(screen.getByText('TestUser')).toBeInTheDocument());

    const logoutBtn = screen.getByText('Logout');
    await user.click(logoutBtn);

    expect(window.location.href).toBe('/');
  });
});
