import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia for SweetAlert2 in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock SweetAlert2 globally to auto-confirm in tests and mock mixin
vi.mock('sweetalert2', () => {
  const SwalMock = {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
    mixin: vi.fn().mockReturnValue({
      fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
    }),
  };
  return {
    default: SwalMock,
    ...SwalMock
  };
});
