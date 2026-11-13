import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme';

/**
 * Theme state (TRD §6.1).
 *
 * `ThemeService` adopts the theme the pre-paint bootstrap already wrote to
 * `<html data-theme>`, so the tests set that attribute to control the initial
 * value. jsdom does not implement `matchMedia`, and monkey-patching a global to
 * fake an OS dark preference is not worth the risk (AGENTS.md), so the
 * OS-preference branch is exercised only through its `typeof` guard.
 */
describe('ThemeService', () => {
  const STORAGE_KEY = 'aizal.theme';

  function create(): ThemeService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(ThemeService);
  }

  afterEach(() => {
    delete document.documentElement.dataset['theme'];
    localStorage.clear();
  });

  it('adopts the theme the bootstrap already put on <html>', () => {
    document.documentElement.dataset['theme'] = 'dark';
    expect(create().theme()).toBe('dark');
  });

  it('reports light when no explicit choice is present', () => {
    delete document.documentElement.dataset['theme'];
    expect(create().theme()).toBe('light');
  });

  it('toggle() flips the signal, the <html> attribute and localStorage', () => {
    const service = create();
    expect(service.theme()).toBe('light');

    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');

    service.toggle();
    expect(service.theme()).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('set() writes the given theme to the signal, the <html> attribute and localStorage', () => {
    const service = create();

    service.set('dark');
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });
});
