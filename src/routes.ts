import { FastifyInstance } from 'fastify';
import { prisma } from './lib/prisma';

export async function appRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return { message: 'Hello World!' };
  });

  // Get all Categories
  app.get('/categories', async () => {
    try {
      const categories = await prisma.categories.findMany();

      const categoriesWithIdAndName = categories.map((category) => {
        return {
          id: category.id,
          name: category.name,
        };
      });

      const categoriesCount = await prisma.categories.count();

      return {
        total: categoriesCount || 0,
        categories: categoriesWithIdAndName || [],
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  });
}
