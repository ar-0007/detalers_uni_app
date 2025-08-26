// Stripe configuration
export const STRIPE_CONFIG = {
  // Replace with your actual Stripe publishable key
  // For development, use test keys that start with 'pk_test_'
  // For production, use live keys that start with 'pk_live_'
  publishableKey: __DEV__ 
    ? 'pk_test_51234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqr' // Test key placeholder
    : 'pk_live_your_live_publishable_key_here', // Live key placeholder
};

// Note: Never commit real Stripe keys to version control
// Use environment variables or secure configuration management in production