# ced-portal-fe

## 0.1.4

### Patch Changes

- 3126317: Disable Mixpanel IP-based geolocation for CED opportunity discovery and card requests (IEG-3393).
  The shared browser SDK now always uses `ip: false`, the JavaScript equivalent of
  `UseIpAddressForGeolocation = false`. The legacy `VITE_ANALYTICS_LOG_IP` setting is
  no longer consumed, preventing environment configuration from re-enabling
  automatic geographic enrichment. Existing analytics data is not modified.
- Updated dependencies [3126317]
  - @pagopa/io-mixpanel@1.0.4

## 0.1.3

### Patch Changes

- 34319d0: Bump `image-size` to 2.0.3 and `react-router-dom` to 6.30.6.

## 0.1.2

### Patch Changes

- 7187aee: patches

## 0.1.1

### Patch Changes

- e22f615: init
