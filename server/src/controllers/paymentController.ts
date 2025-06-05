import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'your_test_secret_key', {
  apiVersion: '2025-04-30.basil',
});

export const handleWebhook = async (req: Request, res: Response) => {
  console.log('inside this baby');
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!sig || !webhookSecret) {
      throw new Error('Missing stripe signature or webhook secret');
    }

    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created': {
        console.log('inside');
        const subscription = event.data.object as Stripe.Subscription;

        // Getting the customer details to find the admin user
        const customer = (await stripe.customers.retrieve(
          subscription.customer as string
        )) as Stripe.Customer;

        if (!customer.email) {
          throw new Error(`Customer has no email associated with subscription: ${subscription.id}`);
        }

        // Updating the admin user's subscription status
        const updatedAdmin = await prisma.adminUsers.update({
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
        const updatedSubscription = event.data.object as Stripe.Subscription;

        const customer = (await stripe.customers.retrieve(
          updatedSubscription.customer as string
        )) as Stripe.Customer;

        if (!customer.email) {
          throw new Error(
            `Customer has no email associated with subscription: ${updatedSubscription.id}`
          );
        }

        // Update the admin user's subscription status based on subscription status
        const updatedAdmin = await prisma.adminUsers.update({
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
        const deletedSubscription = event.data.object as Stripe.Subscription;

        const customer = (await stripe.customers.retrieve(
          deletedSubscription.customer as string
        )) as Stripe.Customer;

        if (!customer.email) {
          throw new Error(
            `Customer has no email associated with subscription: ${deletedSubscription.id}`
          );
        }

        // Set hasAccess to false when subscription is deleted
        const updatedAdmin = await prisma.adminUsers.update({
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
  } catch (error: any) {
    return res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message,
      type: event.type,
    });
  }
};
