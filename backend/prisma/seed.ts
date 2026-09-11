import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('Admin123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@qalibrated.co.ke' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@qalibrated.co.ke',
      password: hashed,
      role: 'Admin',
      status: 'Active',
    },
  });

  const products = [
    {
      name: 'Truck Scale',
      slug: 'truck-scale',
      description: 'Heavy-duty truck weighing systems for accurate load measurement.',
      category: 'Weighing',
      price: 2500000,
      features: JSON.stringify(['High accuracy', 'Weather resistant', 'Digital display']),
    },
    {
      name: 'Load Cell',
      slug: 'load-cell',
      description: 'Precision load cells for industrial weighing applications.',
      category: 'Sensors',
      price: 45000,
      features: JSON.stringify(['Stainless steel', 'IP68', 'High capacity']),
    },
    {
      name: 'Flow Meter Calibration',
      slug: 'flow-meter-calibration',
      description: 'Professional calibration services for flow and pressure instruments.',
      category: 'Calibration',
      price: null,
      features: JSON.stringify(['ISO accredited', 'On-site service', 'Certificate included']),
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  // Sample content — only seeded when the tables are empty, so re-running the
  // seed on every container start never creates duplicates.
  if ((await prisma.announcement.count()) === 0) {
    await prisma.announcement.create({
      data: {
        title: 'Welcome to the new Qalibrated website',
        content: 'We have upgraded our platform with real-time product management, careers and more.',
        isPublished: true,
      },
    });
  }

  if ((await prisma.career.count()) === 0) {
    await prisma.career.create({
      data: {
        title: 'Calibration Engineer',
        department: 'Technical',
        location: 'Nairobi, Kenya',
        type: 'Full-time',
        description: 'Join our team to deliver high-quality calibration services across East Africa.',
        requirements: 'Degree in Engineering or related field. 2+ years experience preferred.',
        isOpen: true,
      },
    });
  }

  console.log('Seed completed. Admin: admin@qalibrated.co.ke / Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
