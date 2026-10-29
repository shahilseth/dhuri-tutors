-- Fake sample listings for the dev Supabase project only. Never run on prod.
-- Names start with "Sample"; phones are 99999000xx (rules.md §4).
-- Spread across subjects, classes, areas and modes so Phase 2 search filters have something to return.

insert into listings
  (slug, ref_code, kind, name, contact_person, phone, whatsapp,
   subjects, classes, boards, modes, area, address, fee_min, fee_max, fee_note,
   timings, about, published, consent_at, last_verified_at)
values
  ('sample-maths-academy', 'D1', 'academy', 'Sample Maths Academy', 'Sample Contact One', '9999900001', null,
   array['maths'], array['9','10','11','12'], array['PSEB','CBSE'], array['academy'],
   'Pathshalla Mohalla', 'Near Sample Market', 800, 1500, 'per subject',
   'Mon-Sat 4-6 pm', 'Sample academy for school maths, classes 9 to 12.',
   true, now(), now()),

  ('sample-english-home-tutor', 'D2', 'teacher', 'Sample English Home Tutor', null, '9999900002', null,
   array['english','spoken-english'], array['6','7','8'], array['PSEB'], array['home'],
   'Janta Nagar', null, 500, 800, null,
   'Evenings 5-7 pm', 'Sample home tutor for English, classes 6 to 8.',
   true, now(), now() - interval '10 days'),

  ('sample-jee-neet-classes', 'D3', 'academy', 'Sample JEE NEET Classes', 'Sample Contact Three', '9999900003', '9999900013',
   array['physics','chemistry','maths'], array['jee','neet','11','12'], array['CBSE'], array['academy','home'],
   'Shivpuri', null, 2000, 4000, 'per month',
   'Mon-Fri 6-8 pm', 'Sample coaching for JEE and NEET aspirants.',
   true, now(), null),

  ('sample-online-coding-classes', 'D4', 'teacher', 'Sample Online Coding Classes', null, '9999900004', null,
   array['coding','computer'], array['8','9','10'], array[]::text[], array['online'],
   'Bank Road', null, null, null, null,
   'Weekends 10 am-12 pm', 'Sample online classes for coding and computer basics.',
   true, now(), now() - interval '70 days'),

  ('sample-nursery-primary-classes', 'D5', 'teacher', 'Sample Nursery Primary Classes', 'Sample Contact Five', '9999900005', null,
   array['all'], array['nursery','lkg','ukg','1','2','3'], array[]::text[], array['home','online'],
   'Pathshalla Mohalla', null, 400, 600, 'per subject',
   'Mon-Sat 3-5 pm', 'Sample classes for nursery to class 3.',
   true, now(), now()),

  ('sample-competitive-exam-coaching', 'D6', 'teacher', 'Sample Competitive Exam Coaching', null, '9999900006', null,
   array['banking','reasoning','quant'], array['banking','ssc'], array[]::text[], array['academy'],
   'Janta Nagar', null, 1000, 2000, null,
   null, 'Sample listing kept unpublished: no consent on file yet.',
   false, null, null);
