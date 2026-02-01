import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyName: z.string().min(1),
});

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body);

      const user = await fastify.prisma.user.findUnique({
        where: { email },
        include: { company: true },
      });

      if (!user || !user.isActive) {
        return reply.status(401).send({ error: 'Ungültige Anmeldedaten' });
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return reply.status(401).send({ error: 'Ungültige Anmeldedaten' });
      }

      // Update last login
      await fastify.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate token
      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatarUrl: user.avatarUrl,
          company: {
            id: user.company.id,
            name: user.company.name,
          },
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Ungültige Eingabe', details: error.errors });
      }
      throw error;
    }
  });

  // Register (creates company + admin user)
  fastify.post('/register', async (request, reply) => {
    try {
      const data = registerSchema.parse(request.body);

      // Check if email exists
      const existingUser = await fastify.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return reply.status(400).send({ error: 'E-Mail bereits registriert' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);

      // Create company and user in transaction
      const result = await fastify.prisma.$transaction(async (tx) => {
        // Create company
        const company = await tx.company.create({
          data: {
            name: data.companyName,
            settings: {
              currency: 'CHF',
              locale: 'de-CH',
              vatRates: {
                standard: 8.1,
                reduced: 2.6,
                special: 3.8,
              },
            },
          },
        });

        // Create admin user
        const user = await tx.user.create({
          data: {
            email: data.email,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            role: 'ADMIN',
            companyId: company.id,
          },
        });

        return { company, user };
      });

      // Generate token
      const token = fastify.jwt.sign({
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        companyId: result.company.id,
      });

      return {
        token,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
          company: {
            id: result.company.id,
            name: result.company.name,
          },
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Ungültige Eingabe', details: error.errors });
      }
      throw error;
    }
  });

  // Get current user
  fastify.get('/me', {
    preHandler: [fastify.authenticate],
  }, async (request: any) => {
    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.id },
      include: { company: true },
    });

    if (!user) {
      throw new Error('Benutzer nicht gefunden');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      twoFactorEnabled: user.twoFactorEnabled,
      company: {
        id: user.company.id,
        name: user.company.name,
        logoUrl: user.company.logoUrl,
      },
    };
  });

  // Change password
  fastify.post('/change-password', {
    preHandler: [fastify.authenticate],
  }, async (request: any, reply) => {
    const schema = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6),
    });

    const { currentPassword, newPassword } = schema.parse(request.body);

    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.id },
    });

    if (!user) {
      return reply.status(404).send({ error: 'Benutzer nicht gefunden' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!validPassword) {
      return reply.status(400).send({ error: 'Aktuelles Passwort ist falsch' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await fastify.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return { success: true, message: 'Passwort erfolgreich geändert' };
  });
};

export default authRoutes;
