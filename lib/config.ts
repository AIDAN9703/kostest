const config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL!,
    databaseUrl: process.env.DATABASE_URL!,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID!,
    imageKitUrlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
    imageKitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    imageKitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
}

export default config;