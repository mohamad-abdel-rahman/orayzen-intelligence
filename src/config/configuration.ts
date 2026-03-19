import * as Joi from 'joi';

export const validationSchema = Joi.object({
  ORAYZEN_API_URL: Joi.string().uri().required(),
  ORAYZEN_API_KEY: Joi.string().required(),
  ORAYZEN_WEBHOOK_SECRET: Joi.string().required(),
  ANTHROPIC_API_KEY: Joi.string().required(),
  GOOGLE_AI_API_KEY: Joi.string().required(),
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_SERVICE_KEY: Joi.string().required(),
  PORT: Joi.number().default(3002),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  APP_PASSCODE: Joi.string().required(),
});

export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3002', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    passcode: process.env.APP_PASSCODE!,
  },
  orayzen: {
    apiUrl: process.env.ORAYZEN_API_URL!,
    apiKey: process.env.ORAYZEN_API_KEY!,
    webhookSecret: process.env.ORAYZEN_WEBHOOK_SECRET!,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
  },
  google: {
    apiKey: process.env.GOOGLE_AI_API_KEY!,
  },
  supabase: {
    url: process.env.SUPABASE_URL!,
    serviceKey: process.env.SUPABASE_SERVICE_KEY!,
  },
});
