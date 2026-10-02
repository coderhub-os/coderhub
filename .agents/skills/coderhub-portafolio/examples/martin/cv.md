# Martín Herrera

+54 9 351 555 0142 | martin.herrera@example.com | [linkedin.com/in/martinherrera-demo](https://linkedin.com/in/martinherrera-demo) | [github.com/martinherrera-demo](https://github.com/martinherrera-demo)
Córdoba, Argentina (remote)

## Professional Summary

Backend engineer with 4 years building payment and integration services in Node.js and TypeScript. At Nimbus Pay I own the ledger and webhook platform that moves USD 40M+ per month for 1,200 merchants; before that I built data-sync APIs for B2B SaaS clients at Tandem Labs.

## Work Experience

### Nimbus Pay — Mar 2023 - Present
Remote from Córdoba

**Senior Backend Engineer** — Jul 2024 - Present
- Redesigned the double-entry ledger service on PostgreSQL, cutting reconciliation mismatches from ~300 to under 10 per month across 1,200 merchants.
- Built an idempotent webhook delivery platform on Redis Streams with retries and signed payloads, raising first-attempt delivery from 91% to 99.4%.
- Led the migration of 14 services from Express to Fastify behind a shared TypeScript SDK, reducing p95 latency by 38%.
- Mentor two junior engineers and run the team's weekly design review.

**Backend Engineer** — Mar 2023 - Jun 2024
- Shipped the payouts API (REST + OpenAPI 3.1) used by every merchant integration, with contract tests in CI.
- Introduced OpenTelemetry tracing across the payment flow, cutting incident triage time from hours to ~20 minutes.

### Tandem Labs — Aug 2021 - Feb 2023
Córdoba, Argentina

**Backend Developer** — Aug 2021 - Feb 2023
- Built REST and GraphQL APIs in Node.js for 6 B2B SaaS clients, syncing CRM and billing data for 300K+ records per day.
- Wrote the job-queue layer on BullMQ that replaced cron scripts and removed duplicate syncs.
- Added integration tests with Testcontainers, taking coverage of the sync services from 35% to 80%.

## Projects

**ledger-lite** — Open Source
A small double-entry ledger library for TypeScript with balance checks and idempotent postings.
Stack: TypeScript, PostgreSQL

## Education

**B.Eng. Information Systems Engineering** — Universidad Tecnológica Nacional (UTN), Córdoba
Mar 2015 - Dec 2021. Final project on event-driven billing.

## Certifications

- AWS Certified Developer – Associate (2024)
- MongoDB Associate Developer (2022)

## Skills

- **Backend:** Node.js, TypeScript, Fastify, Express, NestJS, GraphQL, REST, OpenAPI
- **Data:** PostgreSQL, Redis, MongoDB, BullMQ, Kafka (basics)
- **Infra:** AWS (ECS, Lambda, SQS), Docker, Terraform, GitHub Actions, OpenTelemetry
- **Languages (Spoken):** Spanish (native), English (B2)
