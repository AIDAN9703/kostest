

const config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL!,
    databaseUrl: process.env.DATABASE_URL!,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL!,
    // Use live keys in production, test keys in development
    stripeSecretKey: process.env.NODE_ENV === "development" 
        ? process.env.STRIPE_SECRET_KEY! 
        : process.env.STRIPE_LIVE_SECRET_KEY!,
    stripePublishableKey: process.env.NODE_ENV === "development"
        ? process.env.STRIPE_PUBLISHABLE_KEY!
        : process.env.STRIPE_LIVE_PUBLISHABLE_KEY!,
    stripeWebhookSecret: process.env.NODE_ENV === "development"
        ? process.env.STRIPE_WEBHOOK_SECRET!
        : process.env.STRIPE_LIVE_WEBHOOK_SECRET!,
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID!,
    imageKitUrlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
    imageKitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    imageKitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
}

export default config;