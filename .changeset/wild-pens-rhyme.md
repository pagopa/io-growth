---
"@pagopa/io-mixpanel": patch
"ced-browser-fe": patch
"ced-card-request-fe": patch
---

Disable Mixpanel IP-based geolocation for CED opportunity discovery and card requests (IEG-3393).
The shared browser SDK now always uses `ip: false`, the JavaScript equivalent of
`UseIpAddressForGeolocation = false`. The legacy `VITE_ANALYTICS_LOG_IP` setting is
no longer consumed, preventing environment configuration from re-enabling
automatic geographic enrichment. Existing analytics data is not modified.
