"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetAdmin = resetAdmin;
const client_1 = require("@prisma/client");
const authUtils_1 = require("../utils/authUtils");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
function resetAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Delete all admin users
            yield prisma.adminUsers.deleteMany({});
            console.log('Deleted all admin users');
            // Create new admin user
            const adminUserId = (0, uuid_1.v4)();
            const hashedPassword = (0, authUtils_1.hashPassword)('123456');
            const newAdmin = yield prisma.adminUsers.create({
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
        }
        catch (error) {
            console.error('Error resetting admin:', error);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
// Only run if this file is executed directly
if (require.main === module) {
    resetAdmin();
}
