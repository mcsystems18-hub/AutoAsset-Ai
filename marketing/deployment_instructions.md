# Deployment Instructions - Steadfast Property Care Website

## 1. Hosting Options
We recommend the following platforms for hosting the static React website:
- **Vercel (Recommended):** Best for Next.js/React, seamless integration with GitHub, automatic SSL, and global CDN.
- **Netlify:** Excellent for static sites, includes simple "Form" handling and Serverless Functions for the lead capture backend.
- **GitHub Pages:** Free and simple, but requires more setup for custom domains and doesn't support the Node.js backend directly.

## 2. Build Configuration
The website is built using **Vite**.
- **Build Command:** `npm run build`
- **Output Directory:** `dist/`
- **Node Version:** 18.x or higher

### Environment Variables
For production, set the following variables in your hosting provider's dashboard:
- `VITE_API_URL`: The URL of the lead capture backend (once deployed).

## 3. Deployment Steps (Example: Vercel/Netlify)
1. **Push Code to Repository:** Connect the `~/website` directory to a GitHub/GitLab repository.
2. **Connect to Host:** Log in to Vercel/Netlify and select "New Project" from Git.
3. **Configure Build:**
    - Frameowrk Preset: Vite
    - Build Command: `npm run build`
    - Output Directory: `dist`
4. **Deploy:** Click deploy. The platform will provide a temporary URL.

## 4. Domain Setup
1. **Purchase Domain:** Buy a domain (e.g., `steadfastpropertycare.com`) from a registrar like Namecheap or Google Domains.
2. **Configure DNS:**
    - In your host (Vercel/Netlify), go to "Domain Settings" and add your custom domain.
    - Copy the provided A records or CNAME records.
    - In your registrar's DNS panel, add these records.
3. **Wait for Propagation:** DNS changes can take up to 24-48 hours, though usually much faster.
4. **SSL:** Most modern hosts will automatically provision a free Let's Encrypt SSL certificate once the domain is pointed correctly.
