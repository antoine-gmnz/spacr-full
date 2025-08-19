import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('apod', './routes/apod.tsx'),
  route('space-telescope-gallery', './routes/space-telescope-gallery.tsx'),
  route('mars-rover', './routes/mars-rover.tsx'),
  route('launch-schedule', './routes/launch-schedule.tsx'),
  route('earth-view', './routes/earth-view.tsx'),
] satisfies RouteConfig;
