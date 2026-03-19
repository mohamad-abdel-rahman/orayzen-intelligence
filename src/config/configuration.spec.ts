import configuration from './configuration.js';

describe('configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ORAYZEN_API_URL: 'https://api.example.com',
      ORAYZEN_API_KEY: 'test-jwt',
      ORAYZEN_WEBHOOK_SECRET: 'test-secret',
      ANTHROPIC_API_KEY: 'sk-ant-test',
      GOOGLE_AI_API_KEY: 'AIza-test',
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_KEY: 'test-key',
      PORT: '3002',
      NODE_ENV: 'test',
      APP_PASSCODE: 'test-pass',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns typed config from env vars', () => {
    const config = configuration();
    expect(config.orayzen.apiUrl).toBe('https://api.example.com');
    expect(config.orayzen.apiKey).toBe('test-jwt');
    expect(config.anthropic.apiKey).toBe('sk-ant-test');
    expect(config.supabase.url).toBe('https://test.supabase.co');
    expect(config.app.port).toBe(3002);
  });
});
