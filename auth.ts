import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import type { User, Seller } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import postgres from 'postgres';

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE user_email=${email}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

async function getSeller(email: string): Promise<Seller | undefined> {
  try {
    const seller = await sql<Seller[]>`SELECT * FROM sellers WHERE seller_email=${email}`;
    return seller[0];
  } catch (error) {
    console.error('Failed to fetch seller:', error);
    throw new Error('Failed to fetch seller.');
  }
}

async function getUserOrSeller(email: string): Promise<{ user: User | null; seller: Seller | null; userType: 'user' | 'seller' | null }> {
  const user = await getUser(email);
  if (user) {
    return { user, seller: null, userType: 'user' };
  }

  const seller = await getSeller(email);
  if (seller) {
    return { user: null, seller, userType: 'seller' };
  }

  return { user: null, seller: null, userType: null };
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'role' in user) {
        token.role = user.role as 'user' | 'seller';
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.role && (token.role === 'user' || token.role === 'seller')) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const { user, seller, userType } = await getUserOrSeller(email);

          if (!user && !seller) return null;

          let passwordsMatch = false;
          let returnUser = null;

          if (userType === 'user' && user) {
            passwordsMatch = await bcrypt.compare(password, user.user_password);
            if (passwordsMatch) {
              returnUser = {
                id: user.user_id,
                name: `${user.user_first_name} ${user.user_last_name}`,
                email: user.user_email,
                role: 'user' as const
              };
            }
          } else if (userType === 'seller' && seller) {
            passwordsMatch = await bcrypt.compare(password, seller.seller_password);
            if (passwordsMatch) {
              returnUser = {
                id: seller.seller_id,
                name: `${seller.seller_first_name} ${seller.seller_last_name}`,
                email: seller.seller_email,
                role: 'seller' as const
              };
            }
          }

          if (passwordsMatch && returnUser) {
            return returnUser;
          }
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});