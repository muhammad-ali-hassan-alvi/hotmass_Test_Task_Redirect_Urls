# HubSpot Sheets Sync

A SaaS application that connects Google Sheets to HubSpot content, allowing users to sync published pages with filtering capabilities.

## Features

- **Authentication**: Supabase Auth with email/password and magic link support
- **Google Integration**: OAuth connection to access Google Sheets
- **HubSpot Integration**: Connect using private app tokens to fetch published pages
- **Data Filtering**: Filter pages by language and domain
- **Sheet Sync**: Push filtered data to new tabs in Google Sheets
- **Sync History**: Track all synchronization activities with metadata storage

## Tech Stack

- **Frontend**: Next.js 15, React, TailwindCSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **APIs**: HubSpot CMS API, Google Sheets API
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd hubspot-sheets-sync
npm install
\`\`\`

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_REDIRECT_URI`: OAuth redirect URI (http://localhost:3000/api/google/callback for local development)

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the SQL script in `scripts/create-sync-sessions-table.sql` in your Supabase SQL editor
3. Enable Row Level Security policies as defined in the script

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API and Google Drive API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/google/callback`

### 5. HubSpot Setup

Users will need to provide their own HubSpot private app tokens. To create one:
1. Go to HubSpot Settings > Integrations > Private Apps
2. Create a new private app
3. Grant CMS permissions (read access to pages)
4. Generate and copy the token

### 6. Run the Application

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to access the application.

## Implementation Choices

### Architecture Decisions

1. **Server Components**: Used Next.js App Router with Server Components for better performance and SEO
2. **Authentication Flow**: Implemented both email/password and magic link authentication for user flexibility
3. **Token Storage**: Google OAuth tokens stored in HTTP-only cookies for security
4. **Data Flow**: Pages fetched from HubSpot are kept in memory only, not stored in database
5. **Error Handling**: Comprehensive error handling with user-friendly toast notifications

### Database Design

The `sync_sessions` table stores metadata about each sync operation:
- Links to authenticated users via foreign key
- Stores filter criteria as JSONB for flexibility
- Includes row count for sync success tracking
- Implements RLS for data security

### Security Considerations

1. **Row Level Security**: Implemented on sync_sessions table
2. **Token Security**: OAuth tokens stored in HTTP-only cookies
3. **API Validation**: Input validation on all API endpoints
4. **CORS**: Proper CORS configuration for API routes

### UX Decisions

1. **Progressive Disclosure**: Features unlock as connections are established
2. **Real-time Feedback**: Loading states and progress indicators throughout
3. **Data Preview**: Table preview before syncing to sheets
4. **Filter Persistence**: Applied filters shown in sync history

## API Endpoints

- `POST /api/hubspot/test` - Test HubSpot token validity
- `POST /api/hubspot/pages` - Fetch published pages from HubSpot
- `GET /api/google/auth` - Generate Google OAuth URL
- `GET /api/google/callback` - Handle OAuth callback
- `GET /api/google/check-auth` - Check authentication status
- `GET /api/google/sheets` - List user's Google Sheets
- `POST /api/google/sync` - Sync data to Google Sheets
- `GET /api/sync-history` - Fetch user's sync history

## Assumptions Made

1. **Page Limit**: Limited to 50 pages per sync to avoid API rate limits
2. **Sheet Access**: Users have edit access to their selected Google Sheets
3. **Tab Management**: New tabs are created if they don't exist, existing data is overwritten
4. **Language/Domain**: Extracted from HubSpot page metadata, may not always be available
5. **Token Refresh**: Google tokens are refreshed automatically when possible

## Future Enhancements

1. **Batch Processing**: Handle larger datasets with pagination
2. **Scheduled Syncs**: Allow users to set up automated syncing
3. **Advanced Filters**: More sophisticated filtering options
4. **Data Validation**: Validate data before writing to sheets
5. **Audit Logging**: More detailed logging for troubleshooting

## Deployment

The application is ready for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Update Google OAuth redirect URI to production URL
4. Deploy

## Support

For questions or issues, please refer to the documentation or create an issue in the repository.


# My Env keys. The file name should be .evn.local
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://fglbcbtcccxmvyytpffa.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbGJjYnRjY2N4bXZ5eXRwZmZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDM4MTMsImV4cCI6MjA2NjUxOTgxM30.O9A7FwdOglTMo1N4LWo-_aS9T8u5_mEDK_r8dlC4xZk

# Google OAuth
GOOGLE_CLIENT_ID=233082799354-s9pvg27nkt364cs1v6kg6ksqu87sjmbv.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
# GOOGLE_REDIRECT_URI=http://localhost:3001/api/google/callback


# To get the HubSpot keys
Then secondly you need to create an account at https://www.hubspot.com/

But please allow all the scopes there 

then follow these steps:
*verify your HubSpot token permissions:*

1. Go to your HubSpot account
2. Navigate to *Settings* → *Integrations* → *Private Apps*
3. Find your app and check that it has these scopes:

1. cms.pages.read (for CMS pages)
2. content (for website pages)
3. crm.objects.contacts.read (for contacts - basic test)
