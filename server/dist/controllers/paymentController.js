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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = void 0;
const stripe_1 = __importDefault(require("stripe"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'your_test_secret_key', {
    apiVersion: '2025-04-30.basil',
});
const handleWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('inside this baby');
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
        if (!sig || !webhookSecret) {
            throw new Error('Missing stripe signature or webhook secret');
        }
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
    catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
    try {
        switch (event.type) {
            case 'customer.subscription.created': {
                console.log('inside');
                const subscription = event.data.object;
                // Getting the customer details to find the admin user
                const customer = (yield stripe.customers.retrieve(subscription.customer));
                if (!customer.email) {
                    throw new Error(`Customer has no email associated with subscription: ${subscription.id}`);
                }
                // Updating the admin user's subscription status
                const updatedAdmin = yield prisma.adminUsers.update({
                    where: { email: customer.email },
                    data: {
                        hasAccess: true,
                        priceId: subscription.items.data[0].price.id,
                    },
                });
                if (!updatedAdmin) {
                    throw new Error(`Failed to update admin user with email: ${customer.email}`);
                }
                break;
            }
            case 'customer.subscription.updated': {
                const updatedSubscription = event.data.object;
                const customer = (yield stripe.customers.retrieve(updatedSubscription.customer));
                if (!customer.email) {
                    throw new Error(`Customer has no email associated with subscription: ${updatedSubscription.id}`);
                }
                // Update the admin user's subscription status based on subscription status
                const updatedAdmin = yield prisma.adminUsers.update({
                    where: { email: customer.email },
                    data: {
                        hasAccess: updatedSubscription.status === 'active',
                        priceId: updatedSubscription.items.data[0].price.id,
                    },
                });
                if (!updatedAdmin) {
                    throw new Error(`Failed to update admin user with email: ${customer.email}`);
                }
                break;
            }
            case 'customer.subscription.deleted': {
                const deletedSubscription = event.data.object;
                const customer = (yield stripe.customers.retrieve(deletedSubscription.customer));
                if (!customer.email) {
                    throw new Error(`Customer has no email associated with subscription: ${deletedSubscription.id}`);
                }
                // Set hasAccess to false when subscription is deleted
                const updatedAdmin = yield prisma.adminUsers.update({
                    where: { email: customer.email },
                    data: {
                        hasAccess: false,
                        priceId: null,
                    },
                });
                if (!updatedAdmin) {
                    throw new Error(`Failed to update admin user with email: ${customer.email}`);
                }
                break;
            }
            default:
                throw new Error(`Unhandled event type: ${event.type}`);
        }
        res.json({ received: true, status: 'success' });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Webhook processing failed',
            message: error.message,
            type: event.type,
        });
    }
});
exports.handleWebhook = handleWebhook;
