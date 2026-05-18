/**
 * Environment variable validation module.
 * Validates required env vars at startup and provides typed access.
 */

export interface EnvConfig {
  // Authentication
  adminPassword: string;
  authSecret: string;

  // Paths
  openclawDir: string;

  // Weather (optional)
  weatherLat: string | null;
  weatherLon: string | null;
  weatherTimezone: string | null;
  weatherCity: string | null;

  // Branding (optional)
  appTitle: string;
  agentName: string;
  agentEmoji: string;
  agentDescription: string;
  ownerUsername: string;
  ownerEmail: string;
}

const REQUIRED_VARS: Array<{ key: keyof EnvConfig; envName: string; hint: string }> = [
  { key: "adminPassword", envName: "ADMIN_PASSWORD", hint: "Set a strong password for the admin login" },
  { key: "authSecret", envName: "AUTH_SECRET", hint: "Generate a random 32-char string" },
];

let cachedConfig: EnvConfig | null = null;
let validationErrors: string[] = [];

function getEnvVar(name: string, defaultValue = ""): string {
  return typeof process !== "undefined" ? (process.env[name] ?? defaultValue) : defaultValue;
}

function validate(): EnvConfig {
  validationErrors = [];

  const config: EnvConfig = {
    adminPassword: getEnvVar("ADMIN_PASSWORD"),
    authSecret: getEnvVar("AUTH_SECRET"),
    openclawDir: getEnvVar("OPENCLAW_DIR", ""),
    weatherLat: getEnvVar("WEATHER_LAT") || null,
    weatherLon: getEnvVar("WEATHER_LON") || null,
    weatherTimezone: getEnvVar("WEATHER_TIMEZONE") || null,
    weatherCity: getEnvVar("WEATHER_CITY") || null,
    appTitle: getEnvVar("NEXT_PUBLIC_APP_TITLE", "Mission Control"),
    agentName: getEnvVar("NEXT_PUBLIC_AGENT_NAME", "Mission Control"),
    agentEmoji: getEnvVar("NEXT_PUBLIC_AGENT_EMOJI", "🤖"),
    agentDescription: getEnvVar("NEXT_PUBLIC_AGENT_DESCRIPTION", "Your AI co-pilot"),
    ownerUsername: getEnvVar("NEXT_PUBLIC_OWNER_USERNAME", "admin"),
    ownerEmail: getEnvVar("NEXT_PUBLIC_OWNER_EMAIL", ""),
  };

  for (const { key, envName, hint } of REQUIRED_VARS) {
    if (!config[key]) {
      validationErrors.push(`❌ ${envName} is not set. ${hint}`);
    }
  }

  if (validationErrors.length > 0) {
    if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
      console.error(
        "[env] Missing required environment variables:\n" +
        validationErrors.join("\n") +
        "\n\nSet them in .env.local or your deployment environment."
      );
    } else {
      console.warn(
        "[env] ⚠️  Missing some environment variables:\n" +
        validationErrors.join("\n") +
        "\n\nCreate a .env.local file with these values to get started."
      );
    }
  }

  cachedConfig = config;
  return config;
}

export function getConfig(): EnvConfig {
  if (!cachedConfig) {
    return validate();
  }
  return cachedConfig;
}

export function getValidationErrors(): string[] {
  if (!cachedConfig) validate();
  return validationErrors;
}

export function isConfigValid(): boolean {
  return getValidationErrors().length === 0;
}
