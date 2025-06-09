"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = global.prisma ||
    new client_1.PrismaClient({
        log: ['query', 'error', 'warn'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
// Handle connection errors
prisma
    .$connect()
    .then(() => {
    console.log('Successfully connected to database');
})
    .catch((e) => {
    console.error('Failed to connect to database:', e);
});
exports.default = prisma;
