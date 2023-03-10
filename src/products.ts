import { FastifyInstance } from 'fastify';
import { prisma } from './lib/prisma';
import { z } from 'zod';

export default function productsRoutes(app: FastifyInstance) {
  // Get all Products
  app.get('/products', async () => {
    try {
      const products = await prisma.products.findMany({
        where: {
          isDeleted: false,
        },
      });

      const productCategories = await prisma.categoryProducts.findMany({
        where: {
          product_id: {
            in: products.map((product) => product.id),
          },
        },
      });

      const productsWithIdNameAndStatus = products.map((product) => {
        return {
          id: product.id,
          name: product.name,
          checked: product.checked,
          categoriesIds: productCategories
            .filter((category) => {
              return category.product_id === product.id;
            })
            .map((category) => {
              return category.category_id;
            }),
        };
      });

      const productsCount = await prisma.products.count({
        where: {
          isDeleted: false,
        },
      });

      return {
        total: productsCount || 0,
        products: productsWithIdNameAndStatus || [],
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  });

  // Get all Products by Category
  app.get('/products/:categoryId', async (request, reply) => {
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

      reply.status(200).send({
        total: productsByCategoryCount || 0,
        products: productsWithIdAndName || [],
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  });

  // Post a new Product
  app.post('/product', async (request, reply) => {
    try {
      // Validate the request body with zod
      const productSchema = z.object({
        name: z.string(),
        categoriesIds: z.array(z.string().uuid()),
      });

      const { name, categoriesIds } = productSchema.parse(request.body);

      const product = await prisma.products.create({
        data: {
          name,
          categoryProducts: {
            create: categoriesIds.map((categoryId) => {
              return {
                category: {
                  connect: {
                    id: categoryId,
                  },
                },
              };
            }),
          },
        },
      });

      // Return the created product
      reply.status(201).send({ productCreated: product });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  });

  // Patch a Product
  app.patch('/product/:productId', async (request, reply) => {
    try {
      // Validate the request params and body
      const productIdSchema = z.object({
        productId: z.string().uuid(),
      });

      const productDataSchema = z.object({
        name: z.string().optional(),
        categoryIds: z.array(z.string().uuid()).optional(),
      });

      const { productId } = productIdSchema.parse(request.params);
      const productData = productDataSchema.parse(request.body);

      // Retrieve the product with the given ID using Prisma ORM
      const product = await prisma.products.findFirst({
        where: {
          id: productId,
        },
      });

      // Make sure the product exists
      if (!product) {
        reply.status(404).send({
          error: `Product with ID ${productId} not found`,
        });
        return;
      }

      // Update the product with the new data
      const updatedProduct = await prisma.products.update({
        where: {
          id: productId,
        },
        data: {
          name: productData.name || product.name,
        },
      });

      // Update the categories for the product
      if (productData.categoryIds) {
        // Delete all existing categoryProduct relationships for the product
        await prisma.categoryProducts.deleteMany({
          where: {
            product_id: productId,
          },
        });

        // Create new categoryProduct relationships for the product
        for (const categoryId of productData.categoryIds) {
          await prisma.categoryProducts.create({
            data: {
              product_id: productId,
              category_id: categoryId,
            },
          });
        }
      }

      // Return the updated product to the client
      reply.send({
        updatedProduct: {
          id: updatedProduct.id,
          name: updatedProduct.name,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  });

  app.delete('/product/:productId', async (request, reply) => {
    try {
      // Validate the request params with zod
      const productIdSchema = z.object({
        productId: z.string().uuid(),
      });

      const { productId } = productIdSchema.parse(request.params);

      // Logically delete the product using Prisma ORM
      await prisma.products.update({
        where: {
          id: productId,
        },
        data: {
          deletedAt: new Date(),
          isDeleted: true,
        },
      });

      reply.status(201).send({
        message: `Product with ID ${productId} deleted`,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        reply.status(500).send({
          error: error.message,
        });
      }
    }
  });

  app.patch('/product/:productId/toggle', async (request, reply) => {
    try {
      // Validate the request params with zod
      const productIdSchema = z.object({
        productId: z.string().uuid(),
      });

      const { productId } = productIdSchema.parse(request.params);

      // Get the current state of the "checked" field for the product
      const product = await prisma.products.findUnique({
        where: {
          id: productId,
        },
      });

      // Toggle the "checked" field
      const updatedProduct = await prisma.products.update({
        where: {
          id: productId,
        },
        data: {
          checked: !product?.checked,
        },
      });

      // Get only the id, name and checked fields
      const productWithIdNameAndChecked = {
        id: updatedProduct.id,
        name: updatedProduct.name,
        checked: updatedProduct.checked,
      };

      // Return the updated product
      reply.status(200).send({
        product: productWithIdNameAndChecked,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        reply.status(500).send({
          error: error.message,
        });
      }
    }
  });
}
