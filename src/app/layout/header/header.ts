import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { PROFILE } from '../../content/profile';
import { ThemeService } from '../../core/theme';

/** The in-page sections the nav links to, in document order (PRD §6). */
const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
] as const;

/**
 * Sticky header (PRD §6, FR-1.x).
 *
 * Accessible behaviour of the mobile menu:
 *  - the toggle exposes `aria-expanded` and `aria-controls`
 *  - opening moves focus to the first link in the panel
 *  - Tab cycles within the panel **and the toggle**, so the toggle stays reachable
 *  - Escape closes the panel and returns focus to the toggle
 *
 * The links are plain `<a href="#id">` anchors, so navigation works with
 * JavaScript disabled — the scroll-spy below is progressive enhancement only.
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  /**
   * Escape/Tab are handled as a host listener rather than a template binding:
   * the events bubble up from whichever control inside the header has focus, and
   * a template `(keydown)` on a non-focusable element is an accessibility lint
   * error (`interactive-supports-focus`).
   */
  host: { '(keydown)': 'onKeydown($event)' },
})
export class Header {
  protected readonly profile = PROFILE;
  protected readonly sections = SECTIONS;
  protected readonly theme = inject(ThemeService);

  protected readonly menuOpen = signal(false);
  protected readonly activeSection = signal<string | null>(null);

  private readonly panel = viewChild<ElementRef<HTMLElement>>('mobilePanel');
  private readonly toggleButton = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');
  private readonly destroyRef = inject(DestroyRef);
  private observer?: IntersectionObserver;

  constructor() {
    // Browser-only: never runs during prerender, so the build stays static.
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;

      this.observer = new IntersectionObserver(
        (entries) => {
          const best = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (best) this.activeSection.set(best.target.id);
        },
        { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.2, 0.5, 1] },
      );

      for (const { id } of SECTIONS) {
        const element = document.getElementById(id);
        if (element) this.observer.observe(element);
      }

      this.destroyRef.onDestroy(() => this.observer?.disconnect());
    });
  }

  protected toggleMenu(): void {
    if (this.menuOpen()) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  protected openMenu(): void {
    this.menuOpen.set(true);
    queueMicrotask(() => this.focusables()[0]?.focus());
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
    this.toggleButton()?.nativeElement.focus();
  }

  /** Escape closes; Tab is confined to the panel plus the toggle. */
  protected onKeydown(event: KeyboardEvent): void {
    if (!this.menuOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeMenu();
      return;
    }

    if (event.key !== 'Tab') return;

    const items = this.focusables();
    if (items.length === 0) return;

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  protected themeLabel(): string {
    return this.theme.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  }

  private focusables(): HTMLElement[] {
    const panel = this.panel()?.nativeElement;
    const toggle = this.toggleButton()?.nativeElement;
    const inPanel = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
      : [];
    return toggle ? [toggle, ...inPanel] : inPanel;
  }
}
