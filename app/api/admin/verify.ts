import { prisma } from '@/app/lib/prisma';

export const verifyAdmin = async (userId: string) => {
  const adminAccess = await prisma.admin_access_cache.findUnique({
    where: { user_id: userId }
  });
  return adminAccess?.is_admin || false;
}