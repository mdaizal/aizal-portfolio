import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Not found (PRD §6.8) — prerendered to /404/index.html and wired to CloudFront
 * custom error responses for origin 403 and 404. Must return HTTP 404, never 200.
 */
@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
