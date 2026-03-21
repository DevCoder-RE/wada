# Certification API Research

## Executive Summary

Research on integrating with certification body APIs for supplement verification. Current status: **Mock implementation recommended for MVP, real API integration requires business partnerships**.

---

## 1. NSF Certified for Sport

### Overview

NSF International's Certified for Sport program is the gold standard for supplement certification, recognized by:

- USADA
- Major League Baseball
- National Hockey League
- Canadian Football League
- NFL, NBA, PGA, LPGA

### API Availability

| Type               | Status              | Notes                           |
| ------------------ | ------------------- | ------------------------------- |
| Public REST API    | **NOT AVAILABLE**   | No developer API documented     |
| Product Search     | Web-based only      | nsfsport.com/certified-products |
| Barcode Lookup     | Mobile app only     | NSF Certified for Sport app     |
| Batch Verification | Partner access only | Requires certification          |

### Integration Options

1. **Web Scraping** (NOT RECOMMENDED)
   - Violates Terms of Service
   - Unreliable, easily broken
   - Legal risk

2. **Data Partnership** (RECOMMENDED)
   - Contact NSF: certrec@nsf.org or 800-NSF-MARK
   - Requires business relationship
   - Cost: Variable based on usage

3. **Mock Implementation** (CURRENT)
   - Using seeded data for MVP
   - Can be updated when real API available

### Contact Information

- **Phone**: +1 734-769-8010
- **Email**: certrec@nsf.org
- **URL**: https://www.nsf.org/certified-products-systems/nutritional-wellness/athletic-banned-substances-program

---

## 2. Informed Sport

### Overview

Global leader in supplement certification, testing every batch for 285+ banned substances. Recognized by sporting and governing bodies worldwide.

### API Availability

| Type            | Status            | Notes                         |
| --------------- | ----------------- | ----------------------------- |
| Public REST API | **NOT AVAILABLE** | No developer API documented   |
| Product Search  | Web-based only    | sport.wetestyoutrust.com      |
| Batch ID Lookup | Public access     | Limited to batch verification |
| Brand Directory | Public access     | 330+ certified brands         |

### Integration Options

1. **Data Licensing** (RECOMMENDED)
   - Contact Informed Sport through LGC
   - Partnership required
   - Typically for certified brands

2. **Mock Implementation** (CURRENT)
   - Using seeded data for MVP
   - Can be updated when real API available

### Contact Information

- **URL**: https://sport.wetestyoutrust.com/
- **Partnership Inquiries**: Through website contact form

---

## 3. Global DRO

### Overview

Global DRO is a medication checker (NOT supplement checker) provided by UK Anti-Doping (UKAD) and WADA. It helps athletes verify if their medications are prohibited in sport.

### Important Distinction

Global DRO is for **medications only** - not supplements. It's a separate use case from the supplement certification APIs.

### API Availability

| Type              | Status                | Notes                       |
| ----------------- | --------------------- | --------------------------- |
| Public REST API   | **NOT AVAILABLE**     | No developer API documented |
| Medication Search | Web-based only        | globaldro.com               |
| Ingredient Lookup | Limited public access | For athletes only           |

### Recommended Approach

1. **Link to Global DRO** for medication checks
2. **Not a direct API integration** - direct users to globaldro.com
3. Could create deep-link integration if API becomes available

### Contact Information

- **URL**: https://www.globaldro.com/
- **US Access**: https://www.usada.org/

---

## 4. Current Implementation

### Mock Service Architecture

The current implementation in `libs/api-client/src/certification-service.ts` uses:

```typescript
const MOCK_CERTIFIED_BARCODES = {
  '123456789012': {
    name: 'Whey Protein Isolate',
    brand: 'Optimum Nutrition',
    certifications: ['NSF', 'Informed_Sport'],
  },
  // ... more seeded products
};
```

### Verification Flow

1. Check local cache (24-hour TTL)
2. Check mock data for known barcodes
3. Fall back to DatabaseService lookup
4. Return certification status

---

## 5. Recommendations for Production

### Short-term (MVP)

- Continue with mock implementation
- Maintain seeded database of certified products
- Add batch testing result links where available

### Medium-term (Post-MVP)

1. **NSF Partnership**
   - Reach out to NSF business development
   - Negotiate API access or data licensing
   - Estimated timeline: 3-6 months

2. **Informed Sport Partnership**
   - Contact through LGC ASSURE program
   - Explore product data access
   - Estimated timeline: 3-6 months

3. **Global DRO Integration**
   - Create deep links to globaldro.com
   - Add medication awareness section
   - Low effort, adds value

### Long-term

- Real-time certification database sync
- Batch verification capability
- QR code verification for packaging

---

## 6. Alternative Data Sources

### USDA FoodData Central

- **URL**: https://fdc.nal.usda.gov/api-guide.html
- **API**: Free, public REST API
- **Use Case**: Nutritional information (not certification)
- **Note**: Doesn't include certification status

### Open Food Facts

- **URL**: https://world.openfoodfacts.org/
- **API**: Free, open REST API
- **Data**: Product info, ingredients, labels
- **Note**: User-contributed, not certified data

### NSF/Informed Sport Product Downloads

- Both provide downloadable lists
- Could be imported periodically
- Manual process, not real-time

---

## 7. Compliance Considerations

### Legal Requirements

- Must verify partnership status before using logos
- NSF and Informed Sport logos are trademarked
- Attribution requirements vary by partnership type

### Data Accuracy

- Certification status can change
- Batch testing is per-lot, not per-product
- Need update mechanism for status changes

### User Education

- Supplement certification ≠ medication safety
- Athletes should still verify with governing bodies
- Include disclaimers about limitations

---

## 8. Next Steps

1. **Immediate**: Continue with mock implementation (current state)
2. **Month 1-2**: Document requirements for API access
3. **Month 3-4**: Initiate partnership discussions with NSF and Informed Sport
4. **Month 5-6**: Evaluate API options and pricing
5. **Ongoing**: Monitor for API availability changes

---

## Appendix: External Links

- [NSF Certified for Sport](https://www.nsfsport.com/)
- [Informed Sport](https://sport.wetestyoutrust.com/)
- [Global DRO](https://www.globaldro.com/)
- [USADA Global DRO](https://www.usada.org/)
- [WADA Prohibited List](https://www.wada-ama.org/en/prohibited-list)
