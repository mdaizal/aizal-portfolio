import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../core/seo.service';
import { About } from './sections/about/about';
import { Contact } from './sections/contact/contact';
import { Currently } from './sections/currently/currently';
import { Experience } from './sections/experience/experience';
import { Hero } from './sections/hero/hero';
import { Projects } from './sections/projects/projects';
import { Skills } from './sections/skills/skills';

/**
 * Home — the single scrolling page (PRD §6).
 *
 * Composes the seven sections in document order. Each section owns its own
 * `<section id="…">`, so the header anchors and the scroll-spy resolve with no
 * routing involved. The `<main id="main">` landmark lives in the app shell
 * (`app.html`), not here — a second one would break the skip link.
 */
@Component({
  selector: 'app-home',
  imports: [Hero, Currently, About, Experience, Skills, Projects, Contact],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.apply({
      title: 'Mohd Aizal Baharuddin — Software Engineer · .NET / AWS',
      description:
        'Software Engineer with 5+ years of .NET development across 19 years in software delivery. Now building on AWS. Available immediately.',
    });
  }
}
