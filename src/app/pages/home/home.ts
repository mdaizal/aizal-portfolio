import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Home — the single scrolling page (PRD §6).
 * Phase 1 placeholder: proves prerendering works. The real 7 sections are built in Phase 3.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
