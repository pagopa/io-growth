# ced-card-request-fe

## 0.3.1

### Patch Changes

- 3126317: Disable Mixpanel IP-based geolocation for CED opportunity discovery and card requests (IEG-3393).
  The shared browser SDK now always uses `ip: false`, the JavaScript equivalent of
  `UseIpAddressForGeolocation = false`. The legacy `VITE_ANALYTICS_LOG_IP` setting is
  no longer consumed, preventing environment configuration from re-enabling
  automatic geographic enrichment. Existing analytics data is not modified.
- Updated dependencies [3126317]
  - @pagopa/io-mixpanel@1.0.4

## 0.3.0

### Minor Changes

- 64db1a0: Add Mixpanel tracking to the card request flow (screen views, step completion, back, resume later, submit, success and error events)

## 0.2.1

### Patch Changes

- 34319d0: Bump `image-size` to 2.0.3 and `react-router-dom` to 6.30.6.

## 0.2.0

### Minor Changes

- b578e75: Restore an interrupted card request from the draft data reconciled by the BFF.

## 0.1.1

### Patch Changes

- e22f615: init
