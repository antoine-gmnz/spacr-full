import { AppLoggerMiddlewareMiddleware } from './app-logger-middleware.middleware';

describe('AppLoggerMiddlewareMiddleware', () => {
  it('should be defined', () => {
    expect(new AppLoggerMiddlewareMiddleware()).toBeDefined();
  });
});
