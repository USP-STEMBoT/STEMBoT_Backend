// FILE PATH: src/types/fastify.d.ts
// FILE DESCRIPTION: Custom type declarations for Fastify and Fastify-JWT

import "@fastify/jwt";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      adminUserId: string;
      userName: string;
      userEmailAddress: string;
    };
  }
}
