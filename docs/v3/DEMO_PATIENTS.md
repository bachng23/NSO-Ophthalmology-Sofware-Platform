# Ten synthetic demonstration patients

The fixture `src/backend/nso/data/demo_patients.json` contains exactly ten invented
patients (`SYN-DEMO-001` through `SYN-DEMO-010`), one case each, both OD and OS,
and visits on 2025-11-01, 2026-05-01 and 2026-11-01: 60 AL/SE observations.
All observations explicitly identify their synthetic origin. "Measured" is a
software provenance status in this fixture, not evidence of physical measurement.
No real names, contact details, credentials or clinical records are included.
The fixture is for UI rehearsal, not model training or scientific validation.

## Load on Render

Pushing code does not itself populate the deployed database. After the new commit
has deployed, set **nso-api → Environment → `NSO_DEMO_PATIENTS_ENABLED=true`** and
redeploy. Startup adds missing demo records to the configured database. Existing
records are preserved; identity or same-date measurement conflicts abort the seed
transaction rather than overwrite records. The flag is off by default. Only one
worker should perform the initial seed. Durable `NSO_DATABASE_URL` storage is
required to keep the records across redeployments.

Alternatively, run once from the backend root using the configured database:

```sh
python scripts/seed_demo_patients.py
```

Set the clinical account's `NSO_CLINICAL_ADMIN_PATIENT_IDS` to:

```json
["SYN-DEMO-001","SYN-DEMO-002","SYN-DEMO-003","SYN-DEMO-004","SYN-DEMO-005","SYN-DEMO-006","SYN-DEMO-007","SYN-DEMO-008","SYN-DEMO-009","SYN-DEMO-010"]
```

This is an explicit access-scope change to perform in the hosting dashboard.
The seeder does not create accounts, change passwords or grant permissions.
After redeployment, sign in again; the patient selector should contain these ten
IDs and Patient History should display three visits per eye. Current fitting
inputs for these ten demo IDs now open with invented core assessment values so
reviewers can test without entering every field. The demo banner identifies them
as synthetic. `Load demo data` restores that patient's example; `Clear inputs`
returns to blank numeric inputs. Existing session drafts take precedence when
switching patients. Real patient IDs continue to start blank.

The frontend fixture `src/frontend/app/lib/demo-assessments.json` contains the
invented core assessments. Age and AL match the latest backend demo visit;
sphere/cylinder pairs have matching SE (`sphere + cylinder / 2`). Pupil,
binocular, symptom and lifestyle values are invented examples, not extracted
measurements. Advanced and research measurements remain blank. Loading examples
does not call predict or approval APIs; users still review and confirm. Reloading
or clearing inputs invalidates the previous recommendation and approval.

## Local isolated rehearsal

```sh
NSO_DATABASE_URL=sqlite:////private/tmp/nso-demo-patients.db \
  .venv312/bin/python src/backend/scripts/seed_demo_patients.py
```

Running again reports zero added observations. Deleting or correcting demo
records is not part of the seed operation.

## Verification (1 November 2026)

48 targeted tests passed across demo seeding, clinical authentication, historical
recipe compatibility and V2.1/V2.2 acceptance. Demo-specific checks run against
both in-memory and SQLite stores, covering both eyes, repeated seeding, preservation
of unrelated/later records, identity and measurement collisions with rollback,
patient-scoped case listing and FastAPI startup integration. The CLI was also run
twice against an isolated SQLite file: 60 observations added, then 0 on replay.
No cloud database was modified by these checks.

Frontend prefill verification: 22 frontend tests passed and the Next.js production
build passed. Checks cover fixture/history consistency, automatic fill on demo
sign-in, per-patient draft preservation, explicit confirmation, result invalidation
on reload, clearing inputs and keeping real patient IDs blank. Cloud deployment
of this change must still be verified separately.

Demo refraction correction: all example sphere/cylinder values now follow the
form's 0.25 D step, preserving the original historical SE. Regression checks
validate every populated numeric input against its rendered min/max/step for all
ten demo patients. The new check reproduced the original -1.375 D sphere failure
before correction; prior component submit tests bypassed native form validation.

## Follow-up demo and desktop verification

For the ten demo IDs, generating a recommendation now prepares an explicitly
invented six-month future follow-up: baseline comes from the confirmed assessment,
OD/OS AL change is +0.08/+0.06 mm, sphere change is -0.25 D, and comfort/wear/
compliance fields are filled. `Load demo follow-up` restores this scenario and
clears any prior follow-up result. Real patient follow-up values remain blank.
Optional CSF and adverse-event fields are collapsed, never fabricated. Baseline
date, AL and sphere are read-only when linked to a design. Metrics and footer
actions wrap within the page; the header no longer mislabels every step as
Clinical assessment. Generating a new recommendation clears old follow-up results.

23 frontend tests and the production build passed. Tests cover date clamping
(including leap years), all demo profiles, rendered numeric constraints, explicit
follow-up submission, baseline identity and result invalidation. On Brave desktop,
the local frontend at 3170 was checked against the deployed backend using only
SYN-DEMO-001: sign-in, native clinical form validation, review, prediction and
follow-up assessment succeeded; observed changes were +0.08/+0.06 mm, annualized
OD +0.16 mm/year. This browser test wrote synthetic prediction/outcome records to
the cloud database; it did not release manufacturing or use real patient data.
Screenshot: `followup-demo-2026-11-01.png`. A development hydration warning listed
only extension-injected `bis_*` attributes; it was not suppressed in application
code. The local test server is stopped after inspection. Deployment of the new
frontend on Vercel has not yet been verified. Refit also succeeded on the demo,
created revision R1 and kept manufacturing submission disabled pending approval.
Only explicitly identified demo patients permit future assessment dates for this
invented follow-up/refit scenario; real assessments retain the current-date limit.
