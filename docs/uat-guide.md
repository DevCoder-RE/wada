# User Acceptance Testing (UAT) Guide

This guide provides comprehensive test cases and procedures for UAT.

---

## UAT Overview

### Purpose

User Acceptance Testing validates that the WADA BMAD application meets all functional requirements and is ready for production deployment.

### Scope

| In Scope              | Out of Scope                       |
| --------------------- | ---------------------------------- |
| Web PWA functionality | Flutter mobile app                 |
| Core user workflows   | Real certification API integration |
| Authentication flows  | Production infrastructure          |
| Data persistence      | Performance testing                |

### Test Environment

| Environment | URL                   | Purpose              |
| ----------- | --------------------- | -------------------- |
| Development | http://localhost:3000 | Pre-UAT verification |
| Staging     | (Configure)           | UAT testing          |
| Production  | (Deploy after UAT)    | Final deployment     |

---

## Test Environments Setup

### Development Environment

1. Follow [Installation Guide](installation.md)
2. Start Supabase: `cd supabase && supabase start`
3. Apply migrations: `supabase db push`
4. Start app: `npm run dev`

### Staging Environment (Recommended for UAT)

1. Deploy to staging server
2. Configure production Supabase instance
3. Migrate database schema
4. Seed minimal test data

---

## Pre-UAT Checklist

Before starting UAT:

- [ ] All critical bugs from Phase 1 fixed
- [ ] Database migrations applied
- [ ] Test accounts created
- [ ] Test data seeded
- [ ] UAT team briefed on procedures
- [ ] Bug reporting template ready

---

## Test Case Matrix

### Authentication Module

| TC ID   | Test Case                                           | Priority | Status |
| ------- | --------------------------------------------------- | -------- | ------ |
| AUTH-01 | User can sign up with email/password                | P0       |        |
| AUTH-02 | User can sign in with valid credentials             | P0       |        |
| AUTH-03 | User cannot sign in with invalid credentials        | P0       |        |
| AUTH-04 | User can sign out                                   | P0       |        |
| AUTH-05 | Password reset flow works                           | P1       |        |
| AUTH-06 | Session timeout after inactivity                    | P1       |        |
| AUTH-07 | User cannot access protected routes when logged out | P0       |        |

### Dashboard Module

| TC ID   | Test Case                            | Priority | Status |
| ------- | ------------------------------------ | -------- | ------ |
| DASH-01 | Dashboard loads with user welcome    | P0       |        |
| DASH-02 | Quick stats display correctly        | P0       |        |
| DASH-03 | Quick actions navigate correctly     | P0       |        |
| DASH-04 | Recent activity shows last 5 entries | P0       |        |
| DASH-05 | Stats calculate correctly            | P1       |        |
| DASH-06 | Dashboard loads when no data         | P0       |        |

### Scanner Module

| TC ID   | Test Case                                  | Priority | Status |
| ------- | ------------------------------------------ | -------- | ------ |
| SCAN-01 | Camera permission requested                | P0       |        |
| SCAN-02 | Camera permission denied handling          | P0       |        |
| SCAN-03 | Known barcode returns verified result      | P0       |        |
| SCAN-04 | Unknown barcode shows not found            | P0       |        |
| SCAN-05 | Verified result shows certification badges | P0       |        |
| SCAN-06 | Add entry form appears after scan          | P0       |        |
| SCAN-07 | Entry can be added after scan              | P0       |        |
| SCAN-08 | Scan history persists across sessions      | P1       |        |
| SCAN-09 | Multiple barcodes can be scanned           | P1       |        |

### Logbook Module

| TC ID  | Test Case                                | Priority | Status |
| ------ | ---------------------------------------- | -------- | ------ |
| LOG-01 | Logbook displays entries chronologically | P0       |        |
| LOG-02 | Add entry form works                     | P0       |        |
| LOG-03 | Entry saves to database                  | P0       |        |
| LOG-04 | Entry persists after refresh             | P0       |        |
| LOG-05 | Entry can be edited                      | P0       |        |
| LOG-06 | Entry can be deleted                     | P0       |        |
| LOG-07 | Search filters entries correctly         | P1       |        |
| LOG-08 | Date filter works                        | P1       |        |
| LOG-09 | Compliance summary displays              | P0       |        |
| LOG-10 | Compliance alerts show when applicable   | P1       |        |
| LOG-11 | Empty state displays correctly           | P0       |        |
| LOG-12 | Realtime updates work                    | P2       |        |

### Education Module

| TC ID  | Test Case                            | Priority | Status |
| ------ | ------------------------------------ | -------- | ------ |
| EDU-01 | Education page loads                 | P0       |        |
| EDU-02 | Static content displays              | P0       |        |
| EDU-03 | Dynamic content loads (if available) | P1       |        |
| EDU-04 | Content type icons display           | P1       |        |
| EDU-05 | External links open correctly        | P0       |        |
| EDU-06 | Loading state displays               | P0       |        |
| EDU-07 | Error state displays on failure      | P0       |        |

### Profile Module

| TC ID   | Test Case                             | Priority | Status |
| ------- | ------------------------------------- | -------- | ------ |
| PROF-01 | Profile displays user data            | P0       |        |
| PROF-02 | Profile edit mode toggles             | P0       |        |
| PROF-03 | Profile changes save to database      | P0       |        |
| PROF-04 | Profile changes persist after refresh | P0       |        |
| PROF-05 | Sign out works                        | P0       |        |
| PROF-06 | Cancel edit reverts changes           | P0       |        |

### Cross-Feature

| TC ID    | Test Case                          | Priority | Status |
| -------- | ---------------------------------- | -------- | ------ |
| CROSS-01 | Navigation between all pages works | P0       |        |
| CROSS-02 | Offline mode works for cached data | P1       |        |
| CROSS-03 | PWA installs correctly             | P2       |        |
| CROSS-04 | Responsive design on mobile        | P1       |        |
| CROSS-05 | Responsive design on tablet        | P1       |        |
| CROSS-06 | Responsive design on desktop       | P0       |        |

---

## Detailed Test Cases

### AUTH-01: User Sign Up

**Objective:** Verify user can create new account

**Preconditions:**

- User not logged in
- Valid email address available

**Steps:**

1. Navigate to application
2. Click "Sign up" or "Need an account?"
3. Enter valid email address
4. Enter password (min 8 characters)
5. Click "Sign up"
6. (If email verification enabled) Check email and click link

**Expected Results:**

- Account created successfully
- User redirected to dashboard
- Welcome message displays with email
- User can access all protected features

**Pass Criteria:** User account created and accessible

---

### AUTH-02: User Sign In

**Objective:** Verify user can log in with valid credentials

**Preconditions:**

- User account exists

**Steps:**

1. Navigate to application
2. Click "Sign in"
3. Enter registered email
4. Enter correct password
5. Click "Sign in"

**Expected Results:**

- Login successful
- User redirected to dashboard
- Welcome message with user name
- Protected routes accessible

**Pass Criteria:** User logged in successfully

---

### AUTH-03: Invalid Login Rejection

**Objective:** Verify system rejects invalid credentials

**Preconditions:**

- None

**Steps:**

1. Navigate to application
2. Click "Sign in"
3. Enter registered email
4. Enter incorrect password
5. Click "Sign in"

**Expected Results:**

- Error message displayed
- "Invalid credentials" or similar
- User remains on login page
- No access to protected features

**Pass Criteria:** Invalid credentials rejected with clear error message

---

### SCAN-03: Known Barcode Verification

**Objective:** Verify verified product returns correct result

**Preconditions:**

- User logged in
- Test barcode available

**Steps:**

1. Navigate to Scanner
2. Grant camera permissions (if first time)
3. Hold test barcode `123456789012` in front of camera
4. Wait for barcode detection
5. View verification result

**Expected Results:**

- Barcode detected successfully
- "Verified" badge displayed
- Product name: "Whey Protein Isolate"
- Brand: "Optimum Nutrition"
- Certification badges: NSF, Informed Sport

**Pass Criteria:** Correct verified result displayed

---

### LOG-03: Entry Persistence

**Objective:** Verify entries persist in database

**Preconditions:**

- User logged in
- Supplements available

**Steps:**

1. Navigate to Logbook
2. Click "+ Add Entry"
3. Select supplement
4. Enter amount: 25
5. Select unit: g
6. Add notes: "Test entry"
7. Click "Add Entry"
8. Refresh page (F5 or reload)
9. Locate saved entry

**Expected Results:**

- Entry saved successfully
- Entry appears in list after refresh
- All fields match entered data
- Entry ID assigned

**Pass Criteria:** Entry persists in database across page refresh

---

### PROF-03: Profile Save

**Objective:** Verify profile changes save to database

**Preconditions:**

- User logged in

**Steps:**

1. Navigate to Profile
2. Click "Edit"
3. Change name to "Test User Updated"
4. Change sport to "Testing"
5. Click "Save"
6. Refresh page
7. Verify changes persisted

**Expected Results:**

- Changes saved successfully
- Alert or confirmation displayed
- Changes persist after refresh
- All fields updated

**Pass Criteria:** Profile changes save and persist

---

## Test Data

### Test Accounts

| Email            | Password | Role    | Notes                |
| ---------------- | -------- | ------- | -------------------- |
| test@athlete.com | Test123! | Athlete | Primary test account |
| coach@test.com   | Test123! | Coach   | Coach permissions    |
| admin@test.com   | Test123! | Admin   | Admin access         |

### Test Barcodes

| Barcode      | Product              | Expected Result |
| ------------ | -------------------- | --------------- |
| 123456789012 | Whey Protein Isolate | ✅ Verified     |
| 123456789013 | Creatine Monohydrate | ✅ Verified     |
| 123456789014 | BCAA Complex         | ✅ Verified     |
| 123456789015 | Multivitamin         | ✅ Verified     |
| 123456789016 | Fish Oil             | ✅ Verified     |
| 999999999999 | Unknown              | ⚠️ Not Found    |

---

## Bug Reporting

### Bug Report Template

```markdown
## Bug Report

**Bug ID:** [auto-generated]
**Date:** YYYY-MM-DD
**Tester:** [Name]
**Environment:** Dev/Staging

### Summary

[Brief description]

### Steps to Reproduce

1.
2.
3.

### Expected Behavior

[What should happen]

### Actual Behavior

[What actually happened]

### Screenshots

[Attach if applicable]

### Severity

- [ ] Critical (blocks testing)
- [ ] Major (core feature broken)
- [ ] Minor (feature works with issues)
- [ ] Trivial (cosmetic)

### Priority

- [ ] P0 - Critical
- [ ] P1 - High
- [ ] P2 - Medium
- [ ] P3 - Low

### Status

- [ ] Open
- [ ] In Progress
- [ ] Resolved
- [ ] Won't Fix
```

---

## UAT Sign-Off

### Completion Criteria

UAT is complete when:

- [ ] All P0 test cases pass
- [ ] All P1 test cases pass
- [ ] All P2 test cases pass (or documented)
- [ ] No critical bugs open
- [ ] No major bugs open
- [ ] All minor/trivial bugs documented

### Sign-Off Template

```markdown
## UAT Sign-Off

**Project:** WADA BMAD
**Date:** YYYY-MM-DD
**Version:** v0.5.0-beta

### Test Summary

| Severity      | Total | Passed | Failed | Blocked |
| ------------- | ----- | ------ | ------ | ------- |
| Critical (P0) | X     | X      | X      | X       |
| Major (P1)    | X     | X      | X      | X       |
| Minor (P2)    | X     | X      | X      | X       |
| Trivial (P3)  | X     | X      | X      | X       |
| **Total**     | **X** | **X**  | **X**  | **X**   |

### Blocker Bugs

| Bug ID | Description | Severity |
| ------ | ----------- | -------- |
| -      | None        | -        |

### Open Issues

| Bug ID | Description | Priority |
| ------ | ----------- | -------- |
| -      | None        | -        |

### Comments

[Any additional notes]

### Approval

| Role             | Name | Signature | Date |
| ---------------- | ---- | --------- | ---- |
| Product Owner    |      |           |      |
| QA Lead          |      |           |      |
| Development Lead |      |           |      |

**Status:** ✅ Approved for Production Deployment / ❌ Not Approved
```

---

## Next Steps

After UAT completion:

1. **If Approved:**
   - Deploy to production
   - Monitor for issues
   - Collect user feedback

2. **If Not Approved:**
   - Address critical/major bugs
   - Re-run affected test cases
   - Update sign-off

---

## Contact

For UAT questions:

- QA Lead: [Name/Email]
- Development Lead: [Name/Email]
- Project Manager: [Name/Email]
