import { FastifyInstance } from 'fastify';
import { prisma } from './lib/prisma';
import { z } from 'zod';

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

  // Get all Products
  app.get('/products', async () => {
    try {
      const products = await prisma.products.findMany();

      const productsWithIdAndName = products.map((product) => {
        return {
          id: product.id,
          name: product.name,
        };
      });

      const productsCount = await prisma.products.count();

      return {
        total: productsCount || 0,
        products: productsWithIdAndName || [],
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  });

  // Get all Products by Category
  app.get('/products/:categoryId', async (request) => {
    try {
      // Validate the request params with zod
      const categoryIdSchema = z.object({
        categoryId: z.string().uuid(),
      });

      const { categoryId } = categoryIdSchema.parse(request.params);

      // Find all products and count the products with the given category ID
      const [products, productsByCategoryCount] = await Promise.all([
        prisma.products.findMany({
          where: {
            categoryProducts: {
              some: {
                category: {
                  id: categoryId,
                },
              },
            },
          },
        }),
        // Count all products with the given category ID
        prisma.products.count({
          where: {
            categoryProducts: {
              some: {
                category: {
                  id: categoryId,
                },
              },
            },
          },
        }),
      ]);

      // Map the products to only return the ID and Name
      const productsWithIdAndName = products.map((product) => {
        return {
          id: product.id,
          name: product.name,
        };
      });

      return {
        total: productsByCategoryCount || 0,
        products: productsWithIdAndName || [],
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  });
}
