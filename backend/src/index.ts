import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';
import { registerHabitsRoutes } from './routes/habits.js';
import { registerCheckinRoutes } from './routes/checkin.js';
import { registerProgressRoutes } from './routes/progress.js';

const schema = { ...appSchema, ...authSchema };

// Create application with schema for full database type support
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Set up authentication with Better Auth
app.withAuth();

// Register route modules
registerHabitsRoutes(app);
registerCheckinRoutes(app);
registerProgressRoutes(app);

await app.run();
app.logger.info('Application running');
