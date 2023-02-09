import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  await prisma.categories.deleteMany();
  await prisma.products.deleteMany();
  await prisma.categoryProducts.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: 'Eduardo Muchak',
      email: 'eduardomuchak@gmail.com',
      password: '$2a$10$/0USW8.OquxB/cLpYvj9WOc96RG2DzLhBnbbvfruW7F8JbBxGglpK',
      createdAt: new Date(),
    },
  });

  const category1 = await prisma.categories.create({
    data: {
      name: 'Bebidas',
      icon: 'Bebidas',
      createdAt: new Date(),
    },
  });

  const category2 = await prisma.categories.create({
    data: {
      name: 'Laticínios',
      icon: 'Laticinios',
      createdAt: new Date(),
    },
  });

  const category3 = await prisma.categories.create({
    data: {
      name: 'Grãos e Cereais',
      icon: 'Grãos e Cereais',
      createdAt: new Date(),
    },
  });

  const product1 = await prisma.products.create({
    data: {
      name: 'Coca-Cola Zero Açúcar',
      categoryProducts: {
        create: [
          {
            category: {
              connect: {
                id: category1.id,
              },
            },
          },
        ],
      },
      createdAt: new Date(),
    },
  });

  const product2 = await prisma.products.create({
    data: {
      name: 'Queijo Mussarela Light',
      categoryProducts: {
        create: [
          {
            category: {
              connect: {
                id: category2.id,
              },
            },
          },
        ],
      },
      createdAt: new Date(),
    },
  });

  const product3 = await prisma.products.create({
    data: {
      name: 'Arroz Integral',
      categoryProducts: {
        create: [
          {
            category: {
              connect: {
                id: category3.id,
              },
            },
          },
        ],
      },
      createdAt: new Date(),
    },
  });

  const product4 = await prisma.products.create({
    data: {
      name: 'Feijão Preto',
      categoryProducts: {
        create: [
          {
            category: {
              connect: {
                id: category3.id,
              },
            },
          },
        ],
      },
      createdAt: new Date(),
    },
  });

  console.log('Seed complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
