import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/authUtils';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function resetAdmin() {
  try {
    // Delete all admin users
    await prisma.adminUsers.deleteMany({});
    console.log('Deleted all admin users');

    // Create new admin user
    const adminUserId = uuidv4();
    const hashedPassword = hashPassword('123456');

    const newAdmin = await prisma.adminUsers.create({
      data: {
        adminUserId,
        name: 'Sargun',
        email: 'sargunrocks.152@gmail.com',
        password: hashedPassword,
        hasAccess: true, // Set to true to give immediate access
      },
    });

    console.log('Created new admin user:', {
      adminUserId: newAdmin.adminUserId,
      name: newAdmin.name,
      email: newAdmin.email,
    });
  } catch (error: unknown) {
    console.error('Error resetting admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  resetAdmin();
}
