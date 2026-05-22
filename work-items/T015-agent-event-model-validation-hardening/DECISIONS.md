# T015 Decisions

## 22 May 2026

- Chose a metadata-first event contract to avoid encouraging raw prompt, customer, or secret capture before any gated persistence work.
- Kept the schema and validator self-contained so local verification stays no-network and dependency-free.
- Kept `POST /events` disabled by default and limited the local worker path to a stubbed non-persistent response when explicitly enabled in a local test.
- Hardened smoke validation to fail on child-command exit status instead of silently ignoring errors.
- Documented the current repository phase as runtime scaffold / event model contract rather than repository foundation.
