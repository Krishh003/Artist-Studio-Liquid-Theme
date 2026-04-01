# Shopify Authentication Sync Instructions

Hello Shopify Development Team! To enable seamless authentication syncing between the main Shopify storefront and the Next.js `Artist Studio` Sub-application situated on the same domain (`pristineforests.com/artiststudio`), we need you to create a secure, HMAC-signed JSON endpoint.

This endpoint will allow the Next.js frontend to securely verify if a user has an active Shopify session.

## Steps to Implement

### Step 1: Add the Shared Secret
We need a secret key used by both the Shopify code and the Next.js application to securely sign and verify the JSON payloads.

**Shared Secret:** `pristine_forests_super_secret_auth_key_2026` 
*(Please keep this secure. Once implemented, do not expose this anywhere except in backend components).*

### Step 2: Create a New Liquid Template
In the Shopify theme code, please create a new template under the `templates` directory:
**File Name:** `page.auth-status.liquid`

Paste the exact following content into this new file:

```liquid
{% layout none %}
{% assign shared_secret = "pristine_forests_super_secret_auth_key_2026" %}
{% if customer %}
  {% assign timestamp = "now" | date: "%s" %}
  {% assign payload = customer.id | append: "|" | append: timestamp %}
  {% assign signature = payload | hmac_sha256: shared_secret %}
  {
    "isAuthenticated": true,
    "customer": {
      "id": "{{ customer.id }}",
      "email": "{{ customer.email }}",
      "firstName": "{{ customer.first_name }}",
      "lastName": "{{ customer.last_name }}"
    },
    "timestamp": {{ timestamp }},
    "signature": "{{ signature }}"
  }
{% else %}
  {
    "isAuthenticated": false
  }
{% endif %}
```

### Step 3: Create the Shopify Page
1. Go to **Online Store > Pages** in the Shopify Admin.
2. Click **Add page**.
3. Set the Title to: `Auth Status` (The content box can remain completely empty).
4. On the right-hand sidebar, under **Theme template**, select `auth-status` (this will associate the page with `page.auth-status.liquid`).
5. Ensure the URL handle for this page is exactly `auth-status` (so the URL becomes `pristineforests.com/pages/auth-status`).
6. Click **Save**.

### Conclusion
That's it! When a user visits `/pages/auth-status`, this page will dynamically output their session confirmation encrypted with the HMAC signature without generating any HTML overhead. The Next.js team will handle the rest.
