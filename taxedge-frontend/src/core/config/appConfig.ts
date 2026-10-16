/** Static asset locations, resolved against the deployment base path. */
const baseUrl = import.meta.env.BASE_URL;

export const BRAND_ASSETS = Object.freeze({
  logo: `${baseUrl}assets/brand/taxedge-logo.png`
});
