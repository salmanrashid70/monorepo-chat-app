// Register path aliases for tsx
import { register } from 'tsconfig-paths';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname);

register({
    baseUrl: projectRoot,
    paths: {
        '@/*': ['src/*']
    }
});


