# Vercel Deployment Guide for Pesha's Bake Shop

This guide covers deploying both the admin and website applications to Vercel with proper Supabase integration.

## Prerequisites

1. **Supabase Project Setup**
   - Create a Supabase project at https://supabase.com
   - Run the SQL scripts in the `supabase/` directory in this order:
     - `schema.sql` - Database schema
     - `seed.sql` - Initial data
     - `storage_setup.sql` - Storage buckets for images
     - `fix_rls.sql` - Disable RLS for public access
     - `enable_realtime.sql` - Enable real-time subscriptions
     - `add_email_verification.sql` - Email verification setup

2. **Environment Variables**
   Get these from your Supabase project settings:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations)

## Deployment Steps

### 1. Deploy Admin Panel

```bash
cd admin
```

**Option A: Via Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel
```

**Option B: Via Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import the `admin` folder
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
4. Deploy

### 2. Deploy Website

```bash
cd website
```

**Option A: Via Vercel CLI**
```bash
vercel
```

**Option B: Via Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import the `website` folder
3. Add the same environment variables as admin
4. Add additional variable:
   - `NEXT_PUBLIC_ADMIN_URL`: Your deployed admin panel URL (e.g., https://admin-pesha.vercel.app)
5. Deploy

## Environment Variables Configuration

### Required for Both Admin and Website:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Additional for Website:

```env
NEXT_PUBLIC_ADMIN_URL=https://your-admin-panel.vercel.app
```

## Post-Deployment Configuration

### 1. Verify Supabase Storage Policies

After deployment, ensure your Supabase storage has the correct RLS policies by running `storage_setup.sql` in the Supabase SQL Editor if not already done.

### 2. Test Photo Uploads

1. Log in to the admin panel
2. Navigate to Categories or Products
3. Try uploading an image
4. Verify the image appears and is accessible via the public URL

### 3. Test CMS Functionality

1. Create/edit categories in the admin panel
2. Create/edit products with variants
3. Update site settings (home page content, slides)
4. Verify changes appear on the website

### 4. Test Order Flow

1. Place an order on the website
2. Check the order appears in admin panel
3. Update order status
4. Verify status changes reflect properly

## Troubleshooting

### Photo Uploads Not Working

**Issue**: Images fail to upload on Vercel but work locally

**Solution**:
1. Verify Supabase storage bucket `media` exists
2. Check RLS policies allow public uploads
3. Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
4. Check browser console for specific error messages

### Admin Changes Not Reflecting on Website

**Issue**: Changes made in admin don't appear on website

**Solution**:
1. The sync bridge uses localStorage for development
2. In production, both apps read directly from Supabase
3. Ensure both apps use the same Supabase project
4. Check that `NEXT_PUBLIC_ADMIN_URL` is set correctly on the website

### Environment Variables Not Loading

**Issue**: App falls back to placeholder data

**Solution**:
1. Verify environment variables are set in Vercel project settings
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding environment variables
4. Check Vercel build logs for any configuration errors

### localStorage Errors in Production

**Issue**: Console warnings about localStorage access

**Solution**:
- This is expected and handled gracefully by the safe localStorage helpers
- The app will fall back to Supabase data when localStorage is unavailable
- No action needed - this is normal serverless behavior

## Important Notes

1. **Storage Limits**: Supabase free tier has 500MB storage - monitor usage
2. **RLS Policies**: The `fix_rls.sql` disables RLS for simplicity - consider implementing proper RLS for production
3. **Real-time Updates**: Real-time subscriptions are enabled for orders and customers
4. **Email Verification**: Email verification is set up but requires SMTP configuration in Supabase
5. **Sync Bridge**: The localStorage sync bridge is for development only - production uses Supabase directly

## Performance Optimization

1. **Image Optimization**: Consider using Vercel's image optimization for better performance
2. **Database Indexes**: The schema includes indexes for common queries
3. **Caching**: Consider implementing Redis caching for frequently accessed data
4. **CDN**: Supabase storage uses CDN by default for public files

## Security Considerations

1. **Service Role Key**: Never expose `SUPABASE_SERVICE_ROLE_KEY` on the client side
2. **Admin Access**: The admin panel should be protected with proper authentication
3. **API Routes**: Consider implementing rate limiting on API routes
4. **HTTPS**: Vercel provides HTTPS automatically - always use it

## Support

For issues specific to:
- **Vercel**: Check Vercel documentation at https://vercel.com/docs
- **Supabase**: Check Supabase documentation at https://supabase.com/docs
- **This Project**: Review the code comments and inline documentation
