import { initBot } from './bot';
import { requireEnv } from './config/env';

async function bootstrap(): Promise<void> {
  requireEnv('BOT_TOKEN');
  requireEnv('DB_PASS');
  await initBot();
}

void bootstrap().catch((error) => {
  if (error instanceof Error) {
    console.error(`Application startup failed: ${error.message}`);
  } else {
    console.error('Application startup failed:', error);
  }
  process.exit(1);
});
