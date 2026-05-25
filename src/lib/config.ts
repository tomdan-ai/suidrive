/**
 * SuiDrive Configuration
 * Centralized configuration for all external services
 */

export const config = {
  // Tatum Configuration
  tatum: {
    apiKey: process.env.TATUM_API_KEY || '',
    testnet: process.env.TATUM_TESTNET === 'true',
  },

  // Walrus Configuration
  walrus: {
    publisherUrl: process.env.WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space',
    aggregatorUrl: process.env.WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space',
  },

  // AI Configuration
  ai: {
    nvidia: {
      apiKey: process.env.NVIDIA_API_KEY || '',
    },
    openRouter: {
      apiKey: process.env.OPENROUTER_API_KEY || '',
    },
  },

  // Sui Network Configuration
  sui: {
    network: (process.env.SUI_NETWORK || 'testnet') as 'mainnet' | 'testnet' | 'devnet',
    packageId: process.env.SUI_PACKAGE_ID || '',
  },

  // App Configuration
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
} as const;

// Validation helper
export function validateConfig() {
  const missing: string[] = [];

  if (!config.tatum.apiKey) missing.push('TATUM_API_KEY');
  if (!config.ai.nvidia.apiKey && !config.ai.openRouter.apiKey) {
    missing.push('NVIDIA_API_KEY or OPENROUTER_API_KEY');
  }

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
  }

  return missing.length === 0;
}
