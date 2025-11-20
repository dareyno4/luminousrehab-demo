# User Onboarding System Implementation Guide

## Overview

This document describes the complete user invitation and onboarding system for agency admins to manage clinicians and schedulers.

## Database Schema

### user_invitations Table

Stores pending invitations before users complete their account activation.

```sql
- id: Unique invitation identifier
- tenant_id: Organization/agency ID
- email: User's email address (unique per tenant)
- first_name, last_name: User's name
- role: 'clinician' or 'scheduler'
- activation_code: Unique code for account activation
- activation_link: Full URL with activation code
- phone_number, occupation: Optional user details
- status: 'pending', 'activated', 'expired', or 'revoked'
- created_by: Admin who created the invitation
- created_at, activated_at, expires_at: Timestamps
```

### users Table Additions

```sql
- phone_number: User's phone (moved from separate table)
- occupation: Job title (e.g., "Registered Nurse")
- last_login: Last successful login timestamp
- invitation_id: Links back to original invitation
```

## User Flow

### 1. Admin Creates Invitation

1. Admin clicks "Add User" button
2. Fills out form with:
   - First Name, Last Name (required)
   - Email (required, must be unique)
   - Role: Clinician or Scheduler
   - Occupation (required for clinicians)
   - Phone Number (optional)
3. System generates unique activation code and link
4. Admin receives code/link to share with user

### 2. User Activates Account

1. User receives activation code or link
2. Navigates to `/activate?code=ACTV-xxx`
3. System verifies code is valid and not expired
4. User completes signup:
   - Password creation
   - Confirms/updates phone and occupation
5. System creates Supabase Auth account
6. System creates user record in database
7. Invitation status updated to 'activated'

### 3. User Login

1. User logs in with email/password
2. System updates `last_login` timestamp
3. User sees role-appropriate dashboard

## Service Functions

### createUserInvitation

- Creates invitation record
- Generates activation code and link
- Returns invitation data

### verifyActivationCode

- Validates activation code exists
- Checks if invitation is pending (not activated/expired/revoked)
- Checks if invitation hasn't expired (7 days default)
- Returns invitation data if valid

### activateUserAccount

- Verifies invitation
- Creates Supabase Auth user
- Creates database user record
- Marks invitation as activated
- Returns user and session data

### resendInvitation

- Generates new activation code
- Resets expiration date to +7 days
- Updates invitation status to 'pending'

### revokeInvitation

- Sets invitation status to 'revoked'
- Prevents activation code from being used

### toggleUserActiveStatus

- Activates or deactivates existing users
- Prevents login when inactive

## UI Features

### Users List

- Shows both activated users and pending invitations
- Displays user role, status, activation state
- Shows last login for activated users
- Shows expiration countdown for pending invitations
- Filterable by role and status

### User Cards

- Avatar with role-based color
- Name, email, phone, occupation
- Activation status badge
- Assigned charts count (for clinicians)
- Created date and activated date
- Last login timestamp
- Activation code with copy button
- Resend invitation button (for pending)
- Revoke invitation button (for pending)
- Activate/Deactivate toggle (for activated users)

### Add User Modal

- Tab selection for Clinician vs Scheduler
- Form fields with validation
- Success screen showing activation code
- Copy code and copy link buttons

### Stats Dashboard

- Total Clinicians count
- Total Schedulers count
- Activated Users count
- Pending Invitations count

## Security Considerations

1. **Activation Codes**: Unique, time-limited (7 days)
2. **Email Verification**: Supabase handles email confirmation
3. **Password Requirements**: Enforced by Supabase Auth
4. **Tenant Isolation**: All queries filtered by tenant_id
5. **Admin Authorization**: Only agency admins can create invitations
6. **Expired Invitations**: Automatically marked as expired
7. **One-time Use**: Codes can't be reused after activation

## Email Integration (Future Enhancement)

Currently admins manually share activation codes. Future implementation should:

1. Send email when invitation is created
2. Include activation link in email
3. Send reminder emails before expiration
4. Notify when invitation expires
5. Send welcome email after activation

## Testing Checklist

- [ ] Create clinician invitation
- [ ] Create scheduler invitation
- [ ] Copy activation code
- [ ] Copy activation link
- [ ] Activate account with code
- [ ] Try expired activation code
- [ ] Try activated code again (should fail)
- [ ] Resend invitation (new code)
- [ ] Revoke invitation
- [ ] Try revoked code (should fail)
- [ ] Deactivate user account
- [ ] Reactivate user account
- [ ] View last login timestamp
- [ ] Filter by role
- [ ] Filter by status
- [ ] Search users

## Migration Steps

1. Run `database_migrations/user_invitations.sql` in Supabase SQL Editor
2. Verify tables and indexes created
3. Test invitation creation
4. Test activation flow
5. Deploy frontend changes
