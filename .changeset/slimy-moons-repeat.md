---
"@pagopa/io-core-adapter-ar": patch
"@pagopa/io-core-adapter-inps-ced": patch
"@pagopa/io-core-adapter-one-mail": patch
---

Stop re-running `generate` inside `build`: turbo already runs it as a dependency, and the duplicate run rewrote `src/generated` while `typecheck` was compiling it.
