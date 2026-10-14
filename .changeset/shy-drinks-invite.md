---
"@pagopa/io-core-domain": patch
"ced-browser-be": patch
"ced-portal-be": patch
---

Fix the UTC calendar-date assumption that delayed opportunity publication until
02:00 in Italy during daylight saving time. Use Europe/Rome dates consistently
in the opportunity and place materialized views, publication notifications,
citizen detail access, and portal publication checks.
