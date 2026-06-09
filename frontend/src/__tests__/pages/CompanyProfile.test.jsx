import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CompanyProfile from '../../page/CompanyProfile';
import useAuth from '../../hooks/useAuth';
import * as cafeData from '../../data/cafeData';

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/useNavScroll', () => ({ default: () => false }));
vi.mock('../../data/cafeData');

// Lightweight stubs for child components – isolates the container logic
vi.mock('../../components/CompanyProfile/Navbar', () => ({
  default: ({ authControls, mainTitle }) => (
    <nav data-testid="navbar">
      <span data-testid="navbar-title">{mainTitle}</span>
      {authControls}
    </nav>
  )
}));

vi.mock('../../components/Auth/AuthControls', () => ({
  default: ({ onLoginClick, user }) => (
    <div data-testid="auth-controls">
      {user ? (
        <span data-testid="user-label">Logged In</span>
      ) : (
        <button data-testid="login-btn" onClick={onLoginClick}>Login</button>
      )}
    </div>
  )
}));

vi.mock('../../components/CompanyProfile/Hero', () => ({
  default: ({ mainTitle, shortDesc }) => (
    <section data-testid="hero">
      <h1>{mainTitle}</h1>
      <p>{shortDesc}</p>
    </section>
  )
}));

vi.mock('../../components/CompanyProfile/Stats', () => ({
  default: ({ establishedYear }) => (
    <div data-testid="stats">{establishedYear}</div>
  )
}));

vi.mock('../../components/CompanyProfile/About', () => ({
  default: ({ longDesc }) => <div data-testid="about">{longDesc}</div>
}));

vi.mock('../../components/CompanyProfile/Menu', () => ({
  default: ({ items }) => (
    <div data-testid="menu">
      {items.map((i, idx) => <span key={idx}>{i.name}</span>)}
    </div>
  )
}));

vi.mock('../../components/CompanyProfile/Gallery', () => ({
  default: () => <div data-testid="gallery" />
}));

vi.mock('../../components/CompanyProfile/Contact', () => ({
  default: ({ address }) => <div data-testid="contact">{address}</div>
}));

vi.mock('../../components/CompanyProfile/Footer', () => ({
  default: ({ mainTitle }) => <footer data-testid="footer">{mainTitle}</footer>
}));

vi.mock('../../components/Auth/AuthModal', () => ({
  default: ({ onClose, onLogin, onRegister }) => (
    <div data-testid="auth-modal">
      <button data-testid="modal-close" onClick={onClose}>Close</button>
      <button data-testid="modal-login" onClick={() => onLogin({ email: 'a@b.com', password: '123' })}>Submit Login</button>
      <button data-testid="modal-register" onClick={() => onRegister({ name: 'Test' })}>Submit Register</button>
    </div>
  )
}));

// ── Helpers ─────────────────────────────────────────────────────────────────────

const WEB_INFO = {
  mainTitle: 'Test Cafe',
  shortDesc: 'A test cafe description',
  longDesc: 'Full long description here',
  establishedYear: 2020,
  motto1: 'Motto 1',
  motto2: 'Motto 2',
  motto3: 'Motto 3',
  address: 'Jl. Test 123',
  openingHours: '08:00 - 22:00',
  phoneNumber: '08123456789',
  mapsLink: 'https://maps.google.com',
  gallery: []
};

const MENU_ITEMS = [
  { _id: '1', name: 'Coffee Latte', price: 25000 },
  { _id: '2', name: 'Matcha', price: 30000 }
];

const CATEGORIES = [
  { _id: 'c1', name: 'Espresso' },
  { _id: 'c2', name: 'Non-Coffee' }
];

const mockHandleLogin = vi.fn();
const mockHandleRegister = vi.fn();
const mockHandleSignOut = vi.fn();

const setupMocks = (overrides = {}) => {
  useAuth.mockReturnValue({
    user: overrides.user ?? null,
    handleLogin: mockHandleLogin,
    handleRegister: mockHandleRegister,
    handleSignOut: mockHandleSignOut
  });

  cafeData.getMenuItems.mockResolvedValue(overrides.menuItems ?? MENU_ITEMS);
  cafeData.getCategories.mockResolvedValue(overrides.categories ?? CATEGORIES);
  cafeData.getPublicWebInformation.mockResolvedValue(overrides.webInfo ?? WEB_INFO);
};

const renderPage = () =>
  render(
    <BrowserRouter>
      <CompanyProfile />
    </BrowserRouter>
  );

// ── Tests ───────────────────────────────────────────────────────────────────────

describe('CompanyProfile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  // ── Rendering ──

  it('renders all major layout sections after data loads', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('hero')).toBeInTheDocument();
      expect(screen.getByTestId('stats')).toBeInTheDocument();
      expect(screen.getByTestId('about')).toBeInTheDocument();
      expect(screen.getByTestId('menu')).toBeInTheDocument();
      expect(screen.getByTestId('gallery')).toBeInTheDocument();
      expect(screen.getByTestId('contact')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  it('passes fetched webInfo to child components', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('navbar-title')).toHaveTextContent('Test Cafe');
      expect(screen.getByTestId('footer')).toHaveTextContent('Test Cafe');
      expect(screen.getByTestId('contact')).toHaveTextContent('Jl. Test 123');
    });
  });

  it('passes menu items to the Menu component', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Coffee Latte')).toBeInTheDocument();
      expect(screen.getByText('Matcha')).toBeInTheDocument();
    });
  });

  it('hides the Menu section when menu or categories are empty', async () => {
    setupMocks({ menuItems: [], categories: [] });
    renderPage();

    // Wait for data to settle, then assert Menu is NOT rendered
    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('menu')).not.toBeInTheDocument();
  });

  // ── Data fetching ──

  it('calls all data-fetching functions on mount', async () => {
    renderPage();

    await waitFor(() => {
      expect(cafeData.getMenuItems).toHaveBeenCalledTimes(1);
      expect(cafeData.getCategories).toHaveBeenCalledTimes(1);
      expect(cafeData.getPublicWebInformation).toHaveBeenCalledTimes(1);
    });
  });

  // ── Auth Modal interactions ──

  it('does not show the auth modal initially', () => {
    renderPage();
    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
  });

  it('opens the auth modal when the login button is clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId('login-btn'));

    expect(await screen.findByTestId('auth-modal')).toBeInTheDocument();
  });

  it('closes the auth modal when the close button is clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId('login-btn'));
    expect(await screen.findByTestId('auth-modal')).toBeInTheDocument();

    await user.click(screen.getByTestId('modal-close'));
    await waitFor(() => {
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
    });
  });

  it('calls handleLogin and closes modal on login submit', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId('login-btn'));
    await user.click(screen.getByTestId('modal-login'));

    await waitFor(() => {
      expect(mockHandleLogin).toHaveBeenCalledWith({ email: 'a@b.com', password: '123' });
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
    });
  });

  it('calls handleRegister and closes modal on register submit', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId('login-btn'));
    await user.click(screen.getByTestId('modal-register'));

    await waitFor(() => {
      expect(mockHandleRegister).toHaveBeenCalledWith({ name: 'Test' });
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
    });
  });

  // ── Logged-in state ──

  it('shows "Logged In" text when user is authenticated', async () => {
    setupMocks({ user: { name: 'John' } });
    renderPage();

    expect(screen.getByTestId('user-label')).toHaveTextContent('Logged In');
    expect(screen.queryByTestId('login-btn')).not.toBeInTheDocument();
  });
});
