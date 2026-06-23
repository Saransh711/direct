import path from 'path';
import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { env } from './env';

export function setupSwagger(app: Express): void {
  if (!env.SWAGGER_ENABLED) {
    return;
  }

  const specPath = path.resolve(__dirname, '../docs/openapi.yaml');
  const document = YAML.load(specPath);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(document));
}
