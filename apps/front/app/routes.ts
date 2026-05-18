import { type RouteConfig, index, route, layout } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('apod', './routes/apod.tsx'),
  route('space-telescope-gallery', './routes/space-telescope-gallery.tsx'),
  route('mars-rover', './routes/mars-rover.tsx'),
  route('launch-schedule', './routes/launch-schedule.tsx'),
  route('earth-view', './routes/earth-view.tsx'),
  route('space-explorer', './routes/space-explorer.tsx'),
  route('aurora-map', './routes/aurora-map.tsx'),
  // Auth
  route('login', './routes/login.tsx'),
  route('register', './routes/register.tsx'),
  route('forgot-password', './routes/forgot-password.tsx'),
  route('reset-password', './routes/reset-password.tsx'),
  // Settings (authenticated)
  layout('./routes/settings.tsx', [
    route('settings/profile', './routes/settings.profile.tsx'),
    route('settings/locations', './routes/settings.locations.tsx'),
  ]),
] satisfies RouteConfig;
