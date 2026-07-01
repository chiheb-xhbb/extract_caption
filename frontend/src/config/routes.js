/**
 * Route path constants.
 * Use these everywhere instead of string literals so refactoring
 * a route path is a single-file change.
 */
export const ROUTES = {
  dashboard:  '/',
  project:    (id = ':id') => `/projects/${id}`,
  editor:     (id = ':id') => `/editor/${id}`,
  settings:   '/settings',
  notFound:   '*',
}
