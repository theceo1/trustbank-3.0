//app/api/auth/signups.ts test users
import { prisma } from '@/app/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export const createTestUsers = async () => {
    const users = await Promise.all([
      prisma.users.create({
        data: {
          id: uuidv4(),
          email: "user1@test.com",
          encrypted_password: "hashedPassword1",
          user: {
            create: {
              email: "user1@test.com",
              first_name: "Test",
              last_name: "User1"
            }
          },
          wallets: {
            create: {
              id: uuidv4(),
              balance: 0,
              pending_balance: 0
            }
          }
        }
      }),
      prisma.users.create({
        data: {
          id: uuidv4(),
          email: "user2@test.com",
          encrypted_password: "hashedPassword2",
          user: {
            create: {
              email: "user2@test.com",
              first_name: "Test",
              last_name: "User2"
            }
          },
          wallets: {
            create: {
              id: uuidv4(),
              balance: 0,
              pending_balance: 0
            }
          }
        }
      })
    ]);
    return users;
  }