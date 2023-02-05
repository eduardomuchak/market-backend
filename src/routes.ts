import { FastifyInstance } from 'fastify';

import * as categoriesRoutes from './categories';
import * as productsRoutes from './products';

export async function appRoutes(app: FastifyInstance) {
  app.get('/', async (_request, reply) => {
    reply.status(200).send({ message: 'Hello World!' });
  });

  categoriesRoutes.default(app);
  productsRoutes.default(app);
}
