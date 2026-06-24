import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AdminDashboard from '../../page/AdminDashboard';
import * as cafeData from '../../data/cafeData';
import * as service from '../../data/service';

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../../data/cafeData');
vi.mock('../../data/service');
vi.mock('../../utils/Toast', () => ({ Toast: { fire: vi.fn() } }));

// Sidebar mock that exposes tab-switching buttons
vi.mock('../../components/dashboard/Sidebar', () => ({
  default: ({ activeTab, setActiveTab }) => (
    <div data-testid="sidebar">
      {['front', 'menu', 'order', 'user', 'coupons', 'companyProfile'].map((tab) => (
        <button key={tab} data-testid={`tab-${tab}`} onClick={() => setActiveTab(tab)}>
          {tab}
        </button>
      ))}
      <span data-testid="active-tab">{activeTab}</span>
    </div>
  )
}));

// Content panel mocks
vi.mock('../../components/dashboard/FrontPage', () => ({
  default: ({ dailyStats }) => (
    <div data-testid="front-page">
      <span data-testid="total-orders">{dailyStats?.totalOrders}</span>
    </div>
  )
}));
vi.mock('../../components/dashboard/MenuTable', () => ({
  default: ({ data, onEdit, onDelete }) => (
    <div data-testid="menu-table">
      {data.map((item) => (
        <div key={item._id} data-testid={`menu-item-${item._id}`}>
          <span>{item.name}</span>
          <button data-testid={`edit-${item._id}`} onClick={() => onEdit(item)}>Edit</button>
          <button data-testid={`delete-${item._id}`} onClick={() => onDelete(item)}>Delete</button>
        </div>
      ))}
    </div>
  )
}));
vi.mock('../../components/dashboard/OrderManagement', () => ({
  default: () => <div data-testid="order-manager" />
}));
vi.mock('../../components/dashboard/UserTable', () => ({
  default: ({ rawData, onAssignCoupon }) => (
    <div data-testid="user-table">
      <span data-testid="user-count">{rawData.length}</span>
      <button data-testid="assign-coupon-btn" onClick={() => onAssignCoupon([])}>Assign</button>
    </div>
  )
}));
vi.mock('../../components/dashboard/CouponTable', () => ({
  default: ({ data }) => (
    <div data-testid="coupon-table">
      <span data-testid="coupon-count">{data.length}</span>
    </div>
  )
}));
vi.mock('../../components/dashboard/CompanyProfileEditor', () => ({
  default: () => <div data-testid="company-profile-editor" />
}));

// Modal/SlideOver mocks
vi.mock('../../components/dashboard/AddProductSlideOver', () => ({
  default: ({ isOpen }) => isOpen ? <div data-testid="product-slideover" /> : null
}));
vi.mock('../../components/dashboard/AddCouponSlideOver', () => ({
  default: ({ isOpen }) => isOpen ? <div data-testid="coupon-slideover" /> : null
}));
vi.mock('../../components/dashboard/AssignCoupon', () => ({
  default: ({ isOpen }) => isOpen ? <div data-testid="assign-coupon-modal" /> : null
}));
vi.mock('../../components/dashboard/AddOrderModal', () => ({
  default: ({ isOpen }) => isOpen ? <div data-testid="new-order-modal" /> : null
}));
vi.mock('../../components/dashboard/CafeModal', () => ({
  default: ({ isOpen, title }) => isOpen ? <div data-testid="cafe-modal">{title}</div> : null
}));
vi.mock('../../components/dashboard/OrderDetailModal', () => ({
  default: ({ isOpen }) => isOpen ? <div data-testid="order-detail-modal" /> : null
}));

// ── Test data ──────────────────────────────────────────────────────────────────

const MENU = [
  { _id: 'm1', name: 'Espresso', price: 20000 },
  { _id: 'm2', name: 'Latte', price: 30000 }
];
const CATEGORIES = [{ _id: 'c1', name: 'Coffee' }];
const ORDERS = [{ _id: 'o1', status: 'pending', totalAmount: 50000 }];
const USERS = [{ userId: 'u1', username: 'Alice' }];
const COUPONS = [{ _id: 'cp1', code: 'SAVE10' }];
const DAILY_STATS = { totalOrders: 42, revenue: 2100000 };

const setupMocks = () => {
  cafeData.getMenuItems.mockResolvedValue(MENU);
  cafeData.getCategories.mockResolvedValue(CATEGORIES);
  cafeData.getPublicWebInformation.mockResolvedValue({ mainTitle: 'Admin Cafe' });

  service.getOrders.mockResolvedValue(ORDERS);
  service.getUserStat.mockResolvedValue(USERS);
  service.getUserList.mockResolvedValue(USERS);
  service.getAllCoupon.mockResolvedValue(COUPONS);
  service.getAvailableCoupon.mockResolvedValue([]);
  service.getDailyStats.mockResolvedValue(DAILY_STATS);
  service.deleteProduct.mockResolvedValue({ ok: true });
  service.deleteCoupon.mockResolvedValue({ ok: true });
  service.getOrderDetail.mockResolvedValue({ _id: 'o1' });
};

const renderPage = () =>
  render(
    <BrowserRouter>
      <AdminDashboard />
    </BrowserRouter>
  );

// ── Tests ───────────────────────────────────────────────────────────────────────

describe('AdminDashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  // ── Initial Load ──

  it('renders sidebar and front-page on initial load', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('front-page')).toBeInTheDocument();
    });
  });

  it('fetches all required data on mount', async () => {
    renderPage();

    await waitFor(() => {
      expect(cafeData.getMenuItems).toHaveBeenCalled();
      expect(cafeData.getCategories).toHaveBeenCalled();
      expect(service.getUserStat).toHaveBeenCalled();
      expect(service.getUserList).toHaveBeenCalled();
      expect(service.getAllCoupon).toHaveBeenCalled();
      expect(service.getAvailableCoupon).toHaveBeenCalled();
      expect(service.getDailyStats).toHaveBeenCalled();
    });
  });

  it('passes daily stats to the FrontPage component', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('total-orders')).toHaveTextContent('42');
    });
  });

  // ── Tab Navigation ──

  it('switches to Menu tab and shows MenuTable', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => expect(screen.getByTestId('front-page')).toBeInTheDocument());

    await user.click(screen.getByTestId('tab-menu'));

    await waitFor(() => {
      expect(screen.getByTestId('menu-table')).toBeInTheDocument();
      expect(screen.queryByTestId('front-page')).not.toBeInTheDocument();
    });
  });

  it('switches to Order tab and shows OrderManager', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => expect(screen.getByTestId('front-page')).toBeInTheDocument());

    await user.click(screen.getByTestId('tab-order'));

    await waitFor(() => {
      expect(screen.getByTestId('order-manager')).toBeInTheDocument();
    });
  });

  it('switches to User tab and shows UserTable', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => expect(screen.getByTestId('front-page')).toBeInTheDocument());

    await user.click(screen.getByTestId('tab-user'));

    await waitFor(() => {
      expect(screen.getByTestId('user-table')).toBeInTheDocument();
      expect(screen.getByTestId('user-count')).toHaveTextContent('1');
    });
  });

  it('switches to Coupons tab and shows CouponTable', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => expect(screen.getByTestId('front-page')).toBeInTheDocument());

    await user.click(screen.getByTestId('tab-coupons'));

    await waitFor(() => {
      expect(screen.getByTestId('coupon-table')).toBeInTheDocument();
      expect(screen.getByTestId('coupon-count')).toHaveTextContent('1');
    });
  });

  it('switches to Company Profile tab and shows editor', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => expect(screen.getByTestId('front-page')).toBeInTheDocument());

    await user.click(screen.getByTestId('tab-companyProfile'));

    await waitFor(() => {
      expect(screen.getByTestId('company-profile-editor')).toBeInTheDocument();
    });
  });

  // ── Add New button ──

  it('shows "Add New" button only on menu/order/coupons tabs', async () => {
    const user = userEvent.setup();
    renderPage();

    // Front tab → no Add New
    await waitFor(() => expect(screen.getByTestId('front-page')).toBeInTheDocument());
    expect(screen.queryByText(/Add New/)).not.toBeInTheDocument();

    // Menu tab → Add New visible
    await user.click(screen.getByTestId('tab-menu'));
    await waitFor(() => {
      expect(screen.getByText(/Add New/)).toBeInTheDocument();
    });

    // User tab → no Add New
    await user.click(screen.getByTestId('tab-user'));
    await waitFor(() => {
      expect(screen.queryByText(/Add New/)).not.toBeInTheDocument();
    });
  });

  // ── Menu item display ──

  it('renders menu items from fetched data', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => expect(screen.getByTestId('front-page')).toBeInTheDocument());
    await user.click(screen.getByTestId('tab-menu'));

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
      expect(screen.getByText('Latte')).toBeInTheDocument();
    });
  });
});
