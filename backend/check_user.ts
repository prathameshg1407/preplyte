import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkUser(email: string, plainPassword: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`User ${email} not found`);
    return;
  }

  console.log(`User ${email} found`);
  console.log(`Stored hash: ${user.password}`);
  
  const match = await bcrypt.compare(plainPassword, user.password);
  console.log(`Password match for ${plainPassword}: ${match}`);
  
  const expectedHash = await bcrypt.hash(plainPassword, 12);
  console.log(`Typical hash for ${plainPassword}: ${expectedHash}`);
}

const email = process.argv[2] || 'admin@pvppcoe.ac.in';
const password = process.argv[3] || 'InstituteAdmin123';

checkUser(email, password)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
