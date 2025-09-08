-- Seed data for WADA BMAD project
-- Run this after the initial migration to populate the database with sample data

-- Insert common certifications
INSERT INTO certifications (name, issuer, type, valid_until) VALUES
('NSF Certified for Sport', 'NSF International', 'NSF', '2025-12-31'),
('Informed Sport', 'LGC', 'Informed_Sport', '2025-12-31'),
('ISO 17025 Accredited', 'International Organization for Standardization', 'ISO_17025', '2025-12-31'),
('WADA Compliant', 'World Anti-Doping Agency', 'WADA_Compliant', '2025-12-31');

-- Insert sample supplements
INSERT INTO supplements (name, brand, description, barcode) VALUES
('Whey Protein Isolate', 'Optimum Nutrition', 'High-quality whey protein for muscle recovery', '123456789012'),
('Creatine Monohydrate', 'MuscleTech', 'Pure creatine for strength and power', '123456789013'),
('BCAA Complex', 'Scivation', 'Branched chain amino acids for recovery', '123456789014'),
('Multivitamin', ' Centrum', 'Complete multivitamin for athletes', '123456789015'),
('Fish Oil', 'Nordic Naturals', 'Omega-3 fatty acids for joint health', '123456789016');

-- Get supplement IDs for certification linking
DO $$
DECLARE
    whey_id UUID;
    creatine_id UUID;
    bcaa_id UUID;
    multi_id UUID;
    fish_oil_id UUID;
    nsf_id UUID;
    informed_id UUID;
BEGIN
    -- Get supplement IDs
    SELECT id INTO whey_id FROM supplements WHERE barcode = '123456789012';
    SELECT id INTO creatine_id FROM supplements WHERE barcode = '123456789013';
    SELECT id INTO bcaa_id FROM supplements WHERE barcode = '123456789014';
    SELECT id INTO multi_id FROM supplements WHERE barcode = '123456789015';
    SELECT id INTO fish_oil_id FROM supplements WHERE barcode = '123456789016';

    -- Get certification IDs
    SELECT id INTO nsf_id FROM certifications WHERE type = 'NSF';
    SELECT id INTO informed_id FROM certifications WHERE type = 'Informed_Sport';

    -- Link certifications to supplements
    INSERT INTO supplement_certifications (supplement_id, certification_id) VALUES
    (whey_id, nsf_id),
    (whey_id, informed_id),
    (creatine_id, nsf_id),
    (creatine_id, informed_id),
    (bcaa_id, informed_id),
    (multi_id, nsf_id),
    (fish_oil_id, nsf_id);
END $$;

-- Insert sample ingredients
INSERT INTO ingredients (supplement_id, name, amount, unit) VALUES
-- Whey Protein
((SELECT id FROM supplements WHERE barcode = '123456789012'), 'Protein', 24.0, 'g'),
((SELECT id FROM supplements WHERE barcode = '123456789012'), 'Carbohydrates', 3.0, 'g'),
((SELECT id FROM supplements WHERE barcode = '123456789012'), 'Fat', 1.0, 'g'),

-- Creatine
((SELECT id FROM supplements WHERE barcode = '123456789013'), 'Creatine Monohydrate', 5.0, 'g'),

-- BCAA
((SELECT id FROM supplements WHERE barcode = '123456789014'), 'L-Leucine', 2.5, 'g'),
((SELECT id FROM supplements WHERE barcode = '123456789014'), 'L-Isoleucine', 1.25, 'g'),
((SELECT id FROM supplements WHERE barcode = '123456789014'), 'L-Valine', 1.25, 'g'),

-- Multivitamin (simplified)
((SELECT id FROM supplements WHERE barcode = '123456789015'), 'Vitamin C', 90.0, 'mg'),
((SELECT id FROM supplements WHERE barcode = '123456789015'), 'Vitamin D', 25.0, 'mcg'),
((SELECT id FROM supplements WHERE barcode = '123456789015'), 'Calcium', 200.0, 'mg'),

-- Fish Oil
((SELECT id FROM supplements WHERE barcode = '123456789016'), 'EPA', 650.0, 'mg'),
((SELECT id FROM supplements WHERE barcode = '123456789016'), 'DHA', 450.0, 'mg');