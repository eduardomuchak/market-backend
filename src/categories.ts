import { FastifyInstance } from 'fastify';
import { prisma } from './lib/prisma';
import { z } from 'zod';

export default function categoriesRoutes(app: FastifyInstance) {
  // Get all Categories
  app.get('/categories', async (_request, reply) => {
    try {
      const categories = await prisma.categories.findMany({
        where: {
          isDeleted: false,
        },
      });

      const categoriesWithIdNameAndIcon = categories.map((category) => {
        return {
          id: category.id,
          name: category.name,
          icon: category.icon,
        };
      });

      const categoriesCount = await prisma.categories.count();

      reply.status(200).send({
        total: categoriesCount || 0,
        categories: categoriesWithIdNameAndIcon || [],
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  });

  // Create a new Category
  app.post('/categories', async (request, reply) => {
    try {
      const categorySchema = z.object({
        name: z.string(),
        icon: z.string(),
      });

      const { name, icon } = categorySchema.parse(request.body);

      const category = await prisma.categories.create({
        data: {
          name,
          icon,
        },
      });

      reply.status(201).send({
        createdCategory: { category },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  });

  // Update a Category
  app.put('/categories/:categoryId', async (request, reply) => {
    try {
      const categoryIdSchema = z.object({
        categoryId: z.string().uuid(),
      });

      const { categoryId } = categoryIdSchema.parse(request.params);

      const categorySchema = z.object({
        name: z.string(),
      });

      const { name } = categorySchema.parse(request.body);

      const category = await prisma.categories.update({
        where: {
          id: categoryId,
        },
        data: {
          name,
        },
      });

      reply.status(200).send({
        updatedCategory: { category },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  });

  // Delete a Category
  app.delete('/categories/:categoryId', async (request, reply) => {
    try {
      const categoryIdSchema = z.object({
        categoryId: z.string().uuid(),
      });

      const { categoryId } = categoryIdSchema.parse(request.params);

      await prisma.categories.update({
        where: {
          id: categoryId,
        },
        data: {
          isDeleted: true,
        },
      });

      reply.status(204).send({
        message: `Category with ID ${categoryId} deleted`,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  });
}
