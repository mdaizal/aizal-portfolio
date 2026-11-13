import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Static output mode (`"outputMode": "static"` in angular.json) rejects
 * `RenderMode.Server`, so every route is either prerendered or client-rendered.
 *
 * CloudFront maps origin 403/404 to /404/index.html, so the client-rendered
 * wildcard is a safety net only — it is not the mechanism that serves the 404.
 *
 * The exact files this configuration produces are recorded in TRD.md §4.1
 * (PLAN step 1.4). That recorded result is authoritative over this comment.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '404',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
