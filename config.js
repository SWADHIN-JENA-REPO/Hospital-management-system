/**
 * ============================================================================
 * CarePlus Hospital Management System — Database & Authentication Config
 * Subject: B.Tech CSE DBMS Project
 * Description: Supabase PostgreSQL credentials and hospital administrator config.
 * ============================================================================
 */

const CAREPLUS_CONFIG = {
  // 1. SUPABASE POSTGRESQL CREDENTIALS
  // Note: The base project URL is required (without /rest/v1/ suffix)
  SUPABASE_URL: "https://hzjywoekjcdtsvkmazes.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_tzAeHY2neCmGb-Q1XhEOkg_w3-_v5IW",

  // 2. DEDICATED HOSPITAL ADMINISTRATOR CREDENTIALS
  // As required for the DBMS project authentication:
  ADMIN_USER: {
    username: "admin",
    email: "admin@careplus.com",
    password: "ADMIN@123", // Admin Password as specified
    role: "Administrator",
    hospitalName: "CarePlus Hospital"
  },

  // 3. CLEAN URL HELPER METHOD
  // Automatically normalizes URL even if entered with /rest/v1/ suffix
  getCleanUrl: function () {
    let url = (this.SUPABASE_URL || "").trim();
    while (url.endsWith("/")) {
      url = url.slice(0, -1);
    }
    if (url.endsWith("/rest/v1")) {
      url = url.substring(0, url.length - "/rest/v1".length);
    }
    return url;
  },

  // 4. HELPER METHOD TO CHECK IF REAL SUPABASE DATABASE IS CONFIGURED
  isConfigured: function () {
    const cleanUrl = this.getCleanUrl();
    const cleanKey = (this.SUPABASE_ANON_KEY || "").trim();
    return (
      Boolean(cleanUrl) &&
      !cleanUrl.includes("YOUR_PROJECT_ID") &&
      Boolean(cleanKey) &&
      !cleanKey.includes("YOUR_SUPABASE_ANON_PUBLIC_KEY")
    );
  }
};

// Expose globally to window
if (typeof window !== "undefined") {
  window.CAREPLUS_CONFIG = CAREPLUS_CONFIG;
}
