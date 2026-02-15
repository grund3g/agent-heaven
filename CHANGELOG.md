# Changelog

## [0.7.0](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.6.2...agent-heaven-v0.7.0) (2026-02-15)


### Features

* **actions:** generate actions + integrate checkout to default ([bd0ae18](https://github.com/grund3g/agent-heaven/commit/bd0ae189900f24c3a8a9afc046de5451c00efd77))
* **board:** add project filter ([bd8af0c](https://github.com/grund3g/agent-heaven/commit/bd8af0cf1b47c8e12316afa18e821f10288ac58b))
* **ui:** show counters since last message/output ([033b3c0](https://github.com/grund3g/agent-heaven/commit/033b3c044a1dea26f57e5b2e18b3d8542dddd636))


### Bug Fixes

* **agents:** auto-detect cli paths when PATH is minimal ([88256a3](https://github.com/grund3g/agent-heaven/commit/88256a341dffc581cc53b424c503e338accf1c70))
* **chat:** show queued follow-ups in chat ([a842604](https://github.com/grund3g/agent-heaven/commit/a84260409338bf9a14ae983992cd92ad4c3df0f0))
* **mac:** window dragging + dev app name ([181de43](https://github.com/grund3g/agent-heaven/commit/181de43db62d5d055cd02b02eec13703c0a75b07))
* **ui:** restore improved job footer composer ([9a210bb](https://github.com/grund3g/agent-heaven/commit/9a210bb5c0f7d16a434cd553e6541597982239f0))
* **ui:** show existing actions in Actions dialog ([cff922c](https://github.com/grund3g/agent-heaven/commit/cff922c7891009e92bbade3ab77ae26380f89b23))

## [0.6.2](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.6.1...agent-heaven-v0.6.2) (2026-02-15)


### Bug Fixes

* **win:** spawn .cmd CLIs via cmd.exe ([04ac35b](https://github.com/grund3g/agent-heaven/commit/04ac35b12471170379c71464af17c1786571b46b))

## [0.6.1](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.6.0...agent-heaven-v0.6.1) (2026-02-15)


### Bug Fixes

* **tests:** make Windows fake CLIs exit with correct code ([06535b9](https://github.com/grund3g/agent-heaven/commit/06535b97d7422e53dd7149dec55ae8eb1fd4533e))

## [0.6.0](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.5.0...agent-heaven-v0.6.0) (2026-02-15)


### Features

* add Windows build targets + release workflow ([867af7d](https://github.com/grund3g/agent-heaven/commit/867af7d85e554ee3aec32844fd9a1d5bfab060c4))

## [0.5.0](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.4.0...agent-heaven-v0.5.0) (2026-02-14)


### Features

* **ui:** add terminal tab; remove font style setting ([3c74d63](https://github.com/grund3g/agent-heaven/commit/3c74d63b35b33e3995e4418db66c4735ecb868df))


### Bug Fixes

* **ui:** wire terminal events earlier ([9860999](https://github.com/grund3g/agent-heaven/commit/9860999c65469cfa8a2390a8ed82fa2187a5beb9))

## [0.4.0](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.3.2...agent-heaven-v0.4.0) (2026-02-14)


### Features

* harden Electron, add terminal + agent install ([387e8b9](https://github.com/grund3g/agent-heaven/commit/387e8b9fd7b44e412548ee0c2f31112369098748))
* **ui:** onboarding + agent installer dialog ([26aeacc](https://github.com/grund3g/agent-heaven/commit/26aeaccf2cacd166bf114c7a8da546a220a3e190))


### Bug Fixes

* **ui:** update missing CLI toast ([02fb1b4](https://github.com/grund3g/agent-heaven/commit/02fb1b4f85c6588f993dc1e4a2c8a3839f3e5932))

## [0.3.2](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.3.1...agent-heaven-v0.3.2) (2026-02-14)


### Bug Fixes

* ship updated dock icon ([1aa86d1](https://github.com/grund3g/agent-heaven/commit/1aa86d156e405f9b072ebbd25ad74ae0466f0da3))

## [0.3.1](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.3.0...agent-heaven-v0.3.1) (2026-02-14)


### Bug Fixes

* restore grid logo on landing page ([4ed859d](https://github.com/grund3g/agent-heaven/commit/4ed859d07ddf7a1444c36350e0bc544e1e7ad9a0))

## [0.3.0](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.2.0...agent-heaven-v0.3.0) (2026-02-14)


### Features

* update landing page with new logo, download link, and footer ([ebd0217](https://github.com/grund3g/agent-heaven/commit/ebd02178ee7ce6ca2f134ef3597e894253660321))

## [0.2.0](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.1.0...agent-heaven-v0.2.0) (2026-02-14)


### Features

* add Electron app core ([d9db518](https://github.com/grund3g/agent-heaven/commit/d9db5183b5428effff5a7339c49e631f0f2048a1))
* add rerun UI and queued follow-ups ([34fe2e7](https://github.com/grund3g/agent-heaven/commit/34fe2e72e043faad720c94ebd74a58614319441b))


### Bug Fixes

* **ci:** pass GH_TOKEN to electron-builder for release uploads ([5993b71](https://github.com/grund3g/agent-heaven/commit/5993b71ae53ef97190748e9178b0e7e699581a72))
* **ci:** use PAT for release-please to trigger downstream workflows ([36ff1d4](https://github.com/grund3g/agent-heaven/commit/36ff1d4cbf06a1ef7d749a4cc2031300e97d3202))

## [0.1.0](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.0.1...agent-heaven-v0.1.0) (2026-02-14)


### Features

* add Electron app core ([d9db518](https://github.com/grund3g/agent-heaven/commit/d9db5183b5428effff5a7339c49e631f0f2048a1))
* add rerun UI and queued follow-ups ([34fe2e7](https://github.com/grund3g/agent-heaven/commit/34fe2e72e043faad720c94ebd74a58614319441b))


### Bug Fixes

* **ci:** use PAT for release-please to trigger downstream workflows ([36ff1d4](https://github.com/grund3g/agent-heaven/commit/36ff1d4cbf06a1ef7d749a4cc2031300e97d3202))
