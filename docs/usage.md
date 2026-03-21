# Usage Guide

Complete guide to using the WADA BMAD application.

---

## Getting Started

### First-Time Setup

1. Navigate to the application URL
2. Click "Sign up" to create an account
3. Enter your email and password
4. Verify your email (if enabled)
5. Complete your athlete profile

---

## User Interface Overview

### Navigation

The application has 5 main sections accessible via bottom navigation (mobile) or top menu (desktop):

| Section   | Icon | Purpose                     |
| --------- | ---- | --------------------------- |
| Dashboard | 🏠   | Overview and quick actions  |
| Logbook   | 📓   | Supplement tracking history |
| Scanner   | 📱   | Barcode scanning            |
| Education | 📚   | Learning resources          |
| Profile   | 👤   | Account settings            |

---

## Dashboard

The Dashboard provides an at-a-glance view of your supplement activity.

### Dashboard Sections

1. **Welcome Message**
   - Personalized greeting with your name
   - Quick reminder about WADA compliance

2. **Quick Stats**
   - Total Entries: All logged supplements
   - This Week: Entries in the last 7 days
   - Verified: Number of verified entries

3. **Quick Actions**
   - Scan Supplement: Jump to scanner
   - View Logbook: Jump to logbook

4. **Recent Activity**
   - Last 5 supplement entries
   - Verification status badges
   - Timestamp of each entry

### Dashboard Tips

- Check stats daily to maintain compliance
- Click "Scan Supplement" for quick logging
- Review recent activity for accuracy

---

## Supplement Scanner

The Scanner helps you verify supplements and log them quickly.

### How to Scan

1. Navigate to **Scanner**
2. Grant camera permissions (if prompted)
3. Position barcode within the scanning frame
4. Hold steady until barcode is detected

### Understanding Results

#### Verified Product

When a certified product is found:

| Status      | Badge | Meaning                         |
| ----------- | ----- | ------------------------------- |
| ✅ Verified | Green | Product has valid certification |

**Information displayed:**

- Product name
- Brand
- Certifications (NSF, Informed Sport, etc.)

#### Unknown Product

When a barcode isn't recognized:

| Status     | Badge  | Meaning         |
| ---------- | ------ | --------------- |
| ⚠️ Unknown | Yellow | Not in database |

**Options:**

- Log entry anyway (won't be verified)
- Try scanning again
- Report missing product

### Logging After Scan

1. After scanning, the Add Entry form appears
2. Fill in:
   - Amount
   - Unit (mg, g, ml, capsules, tablets)
   - Notes (optional)
3. Click "Add Entry"
4. Entry is saved to your logbook

### Test Barcodes

For testing without physical products:

| Barcode        | Product              | Status      |
| -------------- | -------------------- | ----------- |
| `123456789012` | Whey Protein Isolate | ✅ Verified |
| `123456789013` | Creatine Monohydrate | ✅ Verified |
| `123456789014` | BCAA Complex         | ✅ Verified |
| `123456789015` | Multivitamin         | ✅ Verified |
| `123456789016` | Fish Oil             | ✅ Verified |
| `999999999999` | Unknown              | ⚠️ Unknown  |

---

## Supplement Logbook

The Logbook is your complete supplement tracking history.

### Viewing Entries

1. Navigate to **Logbook**
2. All entries are listed chronologically (newest first)
3. Each entry shows:
   - Supplement name and brand
   - Amount and unit
   - Verification status
   - Date/time

### Filtering Entries

#### Search

Use the search box to find entries by:

- Supplement name
- Notes content

#### Date Filter

Click the date picker to filter by:

- Specific date
- Date range

### Adding an Entry

**Option 1: From Scanner**

- Scan a barcode
- Fill in the form
- Submit

**Option 2: Manual Entry**

1. Click **+ Add Entry** button
2. Select supplement from dropdown
3. Enter amount and unit
4. Add optional notes
5. Click **Add Entry**

### Editing an Entry

1. Find the entry in the logbook
2. Click **Edit**
3. Modify amount, unit, or notes
4. Click **Save**

### Deleting an Entry

1. Find the entry in the logbook
2. Click **Delete**
3. Confirm deletion

### Compliance Summary

The Compliance Summary section shows:

| Metric             | Description                        |
| ------------------ | ---------------------------------- |
| Total Entries      | All logged supplements             |
| Verified Entries   | Products with valid certifications |
| Compliance Rate    | Percentage of verified entries     |
| Unique Supplements | Number of different products       |

#### Compliance Alerts

Alerts appear when:

- Compliance rate drops below threshold
- Unverified products logged
- Pattern of potential issues

---

## Education

The Education section provides resources about supplement safety.

### Content Types

| Type        | Icon | Description            |
| ----------- | ---- | ---------------------- |
| Article     | 📄   | Written content        |
| Video       | 🎬   | Video content          |
| Infographic | 📊   | Visual guides          |
| Course      | 📚   | Multi-part learning    |
| Webinar     | 🎥   | Live/recorded sessions |

### Featured Content

The top section shows:

- Latest articles
- Popular resources
- Featured guides

### Certification Guide

Learn about supplement certifications:

| Certification           | Description                         |
| ----------------------- | ----------------------------------- |
| NSF Certified for Sport | Third-party testing for athletes    |
| Informed Sport          | Batch testing for banned substances |
| WADA Compliant          | Meets anti-doping standards         |

### Quick Safety Checklist

Before using any supplement:

1. ✅ Check for certification logos
2. ✅ Verify batch testing results
3. ✅ Scan barcode in app
4. ✅ Log usage in journal

---

## Profile

Manage your account and preferences.

### Profile Information

Displayed fields:

- Full Name
- Email
- Sport
- Team
- Date of Birth

### Editing Profile

1. Click **Edit** button
2. Modify fields as needed
3. Click **Save**

Changes are saved to the database.

### Signing Out

Click **Sign Out** to:

- End your session
- Return to login page

---

## Offline Mode

The application works offline for core features.

### Available Offline

| Feature             | Status      |
| ------------------- | ----------- |
| Viewing cached data | ✅          |
| Logging entries     | ⚠️ (queued) |
| Barcode scanning    | ✅          |
| Profile viewing     | ✅          |

### Sync Behavior

When offline:

- Entries are saved locally
- Sync automatically when online
- No data loss

---

## Privacy & Security

### Data Privacy

- All data encrypted in transit (HTTPS)
- Data encrypted at rest (Supabase)
- Row-level security enforced
- User data never shared

### Camera Privacy

- Camera data processed locally
- No images stored or transmitted
- Only barcode value used

### Session Security

- Sessions expire after 30 minutes
- Auto-refresh of tokens
- Secure logout clears all data

---

## Tips for Athletes

### Maintaining Compliance

1. **Scan Every Product**
   - Verify before first use
   - Re-verify batch numbers

2. **Log Consistently**
   - Record every supplement
   - Include timing and dosage

3. **Review Weekly**
   - Check compliance rate
   - Address any alerts

4. **Stay Informed**
   - Check Education resources
   - Review certification changes

### Before Competition

1. Review all logged supplements
2. Verify certifications are current
3. Check prohibited list via Global DRO
4. Allow time for verification

---

## Troubleshooting

### Scanner Issues

**Camera not working:**

- Grant permission in browser
- Check camera is not in use by another app
- Try different browser

**Barcode not detected:**

- Ensure good lighting
- Hold steady
- Clean barcode on packaging

### Logbook Issues

**Entry not saving:**

- Check internet connection
- Clear browser cache
- Try again

**Search not working:**

- Check spelling
- Try partial match
- Clear search to see all

---

## Next Steps

- Review [UAT Guide](uat-guide.md) for testing procedures
- Configure [production environment](configuration.md)
- Set up [monitoring](configuration.md)

---

## Support

For usage questions:

1. Check this guide
2. Review FAQ section
3. Contact support team
