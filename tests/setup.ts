import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load test environment variables
dotenv.config({ path: resolve(__dirname, '../.env.test') });
