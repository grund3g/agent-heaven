# Changelog

## [0.12.3](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.12.2...agent-heaven-v0.12.3) (2026-03-15)


### Bug Fixes

* **electron:** only apply --design override for valid v1/v2 flags ([5d0ac6f](https://github.com/grund3g/agent-heaven/commit/5d0ac6ff6dd5f85b98e210cb2876d3164c0c5190))
* **electron:** only apply --design when set to v1 or v2 ([de511f4](https://github.com/grund3g/agent-heaven/commit/de511f4701ff8c21010211630d0bd09ea5b01313))
* **jobs-manager:** improve workflow and renderer job UI ([ad17c8c](https://github.com/grund3g/agent-heaven/commit/ad17c8cd901dfc50bf78d2dbccd45cbd6b0cc940))
* **jobs:** align renderer UI with jobs manager updates ([428fd6e](https://github.com/grund3g/agent-heaven/commit/428fd6eb18ab5e3ca4f3bfa46f91bb0dbc7b4093))
* **jobs:** align renderer UI with jobs manager updates ([9bce34b](https://github.com/grund3g/agent-heaven/commit/9bce34b6526827c6f84e7f5b798e94741c32f99b))
* **jobs:** sync renderer styling with job handling and tests ([bacb273](https://github.com/grund3g/agent-heaven/commit/bacb273689ad311ee183f81f57a3326eb7a9cd70))
* **renderer:** debounce job log upserts to reduce board rerenders ([8123bc9](https://github.com/grund3g/agent-heaven/commit/8123bc94b79840a683159074ddb79c1b481f882b))
* **ui:** lock design to v1 and debounce job log upserts ([bf99b4e](https://github.com/grund3g/agent-heaven/commit/bf99b4e3c154372cafc40d0020ed0ee18d79a0e6))

## [0.12.2](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.12.1...agent-heaven-v0.12.2) (2026-02-25)


### Bug Fixes

* **tests:** normalize git EOL assertion on windows ([62895a6](https://github.com/grund3g/agent-heaven/commit/62895a68930da0c51b89873ebc73c33bd51b3958))

## [0.12.1](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.12.0...agent-heaven-v0.12.1) (2026-02-25)


### Bug Fixes

* **build:** sync lockfile for npm ci ([8c1b777](https://github.com/grund3g/agent-heaven/commit/8c1b7773431656e8eef4a31ab732331b1d0473ec))

## [0.12.0](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.11.1...agent-heaven-v0.12.0) (2026-02-25)


### Features

* improve job handling, theming, and agent binary installation ([0040a36](https://github.com/grund3g/agent-heaven/commit/0040a3633fc080f994673ce1dfc6c9b488988eda))


### Bug Fixes

* **gemini:** ignore user echo messages and use script-local Node ([4f322d6](https://github.com/grund3g/agent-heaven/commit/4f322d6cd7cb5f01b9795d825946f791ba066831))
* **jobs:** initialize jobs manager during app startup with tests ([6fb8e4e](https://github.com/grund3g/agent-heaven/commit/6fb8e4e71b8e903b9eba80023e3a6894980b2dbd))

## [0.11.1](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.11.0...agent-heaven-v0.11.1) (2026-02-21)


### Bug Fixes

* restore broken settings/integrations/helper UI and MCP wiring after merge-corrupted rollback
* recover current jobs/session rendering flow while preserving existing local session data
* keep Linear API auth header handling compatible with direct API key format

## [0.11.0](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.10.0...agent-heaven-v0.11.0) (2026-02-18)


### Miscellaneous Chores

* release 0.11.0 (no user-facing changes)

## [0.10.0](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.9.1...agent-heaven-v0.10.0) (2026-02-17)


### Features

* **integrate:** add agent mode with CLI fallback ([dfffd94](https://github.com/grund3g/agent-heaven/commit/dfffd94fc28f8a35a279611603a4b935fe75babc))
* **integrate:** automate quick action commit and archive flow ([0971cbb](https://github.com/grund3g/agent-heaven/commit/0971cbb84870ddfc2d2c19b24381a4c0b0da7576))
* **renderer:** add sessions table/list display mode ([8cc7b99](https://github.com/grund3g/agent-heaven/commit/8cc7b992704871da366b40c105eac1b48167c783))
* **renderer:** update files ([af34450](https://github.com/grund3g/agent-heaven/commit/af344501cafccaeb2ff3f2c3f31edc88a5e86d9c))
* **renderer:** update index layout, UI behavior, and styles ([7587d1e](https://github.com/grund3g/agent-heaven/commit/7587d1ea9d0a83a68f8de5c7b7d9157ad6233610))
* **renderer:** update renderer.js ([b6cff07](https://github.com/grund3g/agent-heaven/commit/b6cff07a790182ea28a9b8afd0001e66842feb51))
* **renderer:** update renderer.js ([3787e7c](https://github.com/grund3g/agent-heaven/commit/3787e7c04bae980f9cd81e1ed91801b4d8e8cef8))
* **renderer:** update renderer.js ([2d6a434](https://github.com/grund3g/agent-heaven/commit/2d6a4348cd775ab0a3468f2a9fa4d373cbfb80cb))
* **renderer:** update styles.css ([25fb283](https://github.com/grund3g/agent-heaven/commit/25fb283dd95e2f890d0ebdb65c33e1f679130750))
* **renderer:** update styles.css ([05010b6](https://github.com/grund3g/agent-heaven/commit/05010b6cec4a8cb0599e473f89036276eec8f1ee))
* **renderer:** update UI behavior and styles ([7b12e86](https://github.com/grund3g/agent-heaven/commit/7b12e86bab886ea072c52cb53201d63f2cc5616e))
* **ui:** show context usage and fix integrate action trigger ([fbd4bba](https://github.com/grund3g/agent-heaven/commit/fbd4bba2a8488271c187fdd37b308f1ea797c06e))
* update renderer and src ([deba378](https://github.com/grund3g/agent-heaven/commit/deba378aa01e58e327c5ba3c20e122466a223c55))
* update renderer, src, and tests ([bc621e4](https://github.com/grund3g/agent-heaven/commit/bc621e4d5a2284feadbec271a067edf9924da146))
* update renderer, src, and tests ([f6e4d8a](https://github.com/grund3g/agent-heaven/commit/f6e4d8a5c02bbe21e3fde3f05e71ef190be3db76))
* update src and tests ([cfc5893](https://github.com/grund3g/agent-heaven/commit/cfc5893de41652308ef15ff25789adbb53e9e2aa))


### Bug Fixes

* **board:** keep empty lanes visible in kanban view ([75ab4a2](https://github.com/grund3g/agent-heaven/commit/75ab4a2c84a0ca4535220938d7648791782484bc))
* **electron:** harden jobs manager startup and renderer initialization ([d2b1389](https://github.com/grund3g/agent-heaven/commit/d2b1389d1cb851f25aa57a7e66373c4b874ce9ff))
* **electron:** stabilize jobs startup, terminals, and git normalization ([3411fbe](https://github.com/grund3g/agent-heaven/commit/3411fbe79e176902cbd5f370c4fd951949c68bad))
* **integrate:** start action immediately and harden commit suggestions ([6d0b415](https://github.com/grund3g/agent-heaven/commit/6d0b415de614f3cb35e30f65ea467fc2c0c0c741))
* **integrate:** sync running lane, archive toast, and action chat log ([120e27a](https://github.com/grund3g/agent-heaven/commit/120e27a9cf55235310ea076020cd8b115223bf49))
* **renderer:** make board lanes horizontally scrollable on narrow screens ([3cb4f7c](https://github.com/grund3g/agent-heaven/commit/3cb4f7ccf26a3c2b46ff2ae11665471b7a8b3740))
* **tests:** resolve merge conflict artifacts ([020889d](https://github.com/grund3g/agent-heaven/commit/020889d73dbda0ed242ccf7fba8e7e1de0966f2f))
* **ui:** honor hidden state and contain table width ([e9634a4](https://github.com/grund3g/agent-heaven/commit/e9634a40ba46232ed5288b9b7269f23fa29422ce))

## [0.9.1](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.9.0...agent-heaven-v0.9.1) (2026-02-16)


### Bug Fixes

* **tests:** normalize EOLs in git cherry-pick test ([694bdf6](https://github.com/grund3g/agent-heaven/commit/694bdf6174f962d096665d10d05ebe593ce32501))

## [0.9.0](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.8.0...agent-heaven-v0.9.0) (2026-02-16)


### Features

* add default commit & push actions ([6e5665d](https://github.com/grund3g/agent-heaven/commit/6e5665dde685ab88e4484cf8d9d467bcefcd1516))
* auto update card titles on context change ([d580c57](https://github.com/grund3g/agent-heaven/commit/d580c570e9339f03d5f67b99cb7651c2d37b4e18))
* better auto title handling ([38c8c24](https://github.com/grund3g/agent-heaven/commit/38c8c2480f6ffe3b0e6a581c063be4aff1815e17))
* better commit defaults ([916e4c8](https://github.com/grund3g/agent-heaven/commit/916e4c820ed1028cff0b7d6e0d273585d480c279))
* better commit messages ([67ce7cd](https://github.com/grund3g/agent-heaven/commit/67ce7cda5a3d5a7e57cbdd74f4cebe9d328e24d8))
* better Needs Attention vs Done classification ([5b7e5c0](https://github.com/grund3g/agent-heaven/commit/5b7e5c08d5e9160783660d18ef60b07a2e1bf780))
* include merged flag / label ([1138047](https://github.com/grund3g/agent-heaven/commit/113804775faeb8ab2ef89e5f159c69670415d796))
* open-in-Code-Button in Tasks ([6cd9a9a](https://github.com/grund3g/agent-heaven/commit/6cd9a9a2ab88c83e949c53ee45cb59612e25233f))
* option to auto archive tasks after work tree action ([8818f50](https://github.com/grund3g/agent-heaven/commit/8818f50dc40d70602fd9ceaba10e1b9a4c062984))
* optional temp folder delete ([d912cf1](https://github.com/grund3g/agent-heaven/commit/d912cf1872c1302527ab55135458deee1690a521))
* **renderer:** checkpoint changes ([5171b1c](https://github.com/grund3g/agent-heaven/commit/5171b1cfa768b1ea9b1177b13883dd8a5eafd774))
* **ui:** improve integrate-to-default action feedback ([684f577](https://github.com/grund3g/agent-heaven/commit/684f577a15f3c6b783cfd3b60080e62f1d6715e4))


### Bug Fixes

* **git:** skip empty cherry-pick steps during batch integration ([4f31449](https://github.com/grund3g/agent-heaven/commit/4f314495567a1bed1030d8d61f53fc7aa844eaac))
* improve session commit message suggestions ([7c7bd80](https://github.com/grund3g/agent-heaven/commit/7c7bd8043c52cbdf3631572cd72fc9a7b441bd21))
* **integrate:** clear stale merged marker ([3243c22](https://github.com/grund3g/agent-heaven/commit/3243c226f991806042320922941fa23af7f85b0f))
* remove merged label from non merged tasks ([f7db773](https://github.com/grund3g/agent-heaven/commit/f7db7737a04eb614a29f27759ceedc96a4ab3772))
* **renderer:** allow app-wide file drops with focused composer highlight ([453db70](https://github.com/grund3g/agent-heaven/commit/453db708163261aaead2691a7dc51556f19f0da8))
* **renderer:** fix markdown in chat view ([c06abb2](https://github.com/grund3g/agent-heaven/commit/c06abb270166a7dd969c2c9b654c38b4456ec167))

## [0.8.0](https://github.com/grund3g/agent-heaven/compare/agent-heaven-v0.7.0...agent-heaven-v0.8.0) (2026-02-16)


### Features

* **actions:** ship integrate-to-default built-in action ([29c715f](https://github.com/grund3g/agent-heaven/commit/29c715f88b5b83ce43c7dd7eff64d94c5fbf3700))
* **actions:** suggest commit message for integrate-to-default ([ddb89dd](https://github.com/grund3g/agent-heaven/commit/ddb89dd5d70c5082a4d5caeb2ed42bdc28614f42))
* checkpoint changes ([fab399c](https://github.com/grund3g/agent-heaven/commit/fab399ce5580b50b7ba5571420cca273cce6484b))
* **composer:** add checkout strategy dropdown override ([a9fa79f](https://github.com/grund3g/agent-heaven/commit/a9fa79f101e915c31e2829b3731fe9dd7b68ba36))
* **composer:** add file path autocomplete in prompt ([abaf5f4](https://github.com/grund3g/agent-heaven/commit/abaf5f4023a5edb8a22de533ad960548804dfd29))
* **renderer:** button alignment ([e0f88ba](https://github.com/grund3g/agent-heaven/commit/e0f88bafe3eb03d88994ed2cb656cd758e2b1ec8))
* **renderer:** show dropped files as attachment tiles ([7d90321](https://github.com/grund3g/agent-heaven/commit/7d90321e0426dbd49ea815c109bcc8ea6a965b26))
* **renderer:** update styles.css ([544dbe5](https://github.com/grund3g/agent-heaven/commit/544dbe526c275d8f7bbd19ff41f97eb14a8c1ff0))
* **ui:** add demo mode with mock projects + jobs ([4270ab2](https://github.com/grund3g/agent-heaven/commit/4270ab265b87fdb45dbc0ca82046c7e20fd559a5))
* **ui:** add demo mode with mock projects + jobs ([6fd9bf3](https://github.com/grund3g/agent-heaven/commit/6fd9bf3f8a06d672e82a76c965b1988696ed07db))
* **ui:** add demo mode with mock projects + jobs ([7cc3ce3](https://github.com/grund3g/agent-heaven/commit/7cc3ce35630c1ea69318bf041a03128edb860067))
* **ui:** add demo mode with mock projects + jobs ([00bb8b1](https://github.com/grund3g/agent-heaven/commit/00bb8b1d3dd8d5dc20d9a3bb1ea828965ce4478d))
* **ui:** add demo mode with mock projects + jobs ([3059ce4](https://github.com/grund3g/agent-heaven/commit/3059ce4c12e160314c397fc909a4a2ea315fd7ba))
* **ui:** support file drag-drop paths and improve integrate commit suggestions ([330d365](https://github.com/grund3g/agent-heaven/commit/330d365911cee4aedafcd9392df31ba9d2b490f9))


### Bug Fixes

* **actions:** seed built-in actions into existing settings ([db5d7c0](https://github.com/grund3g/agent-heaven/commit/db5d7c06cf7474134fbd4b3a963c6bf6694f083e))
* better job title guessing for low-signal lead-ins ([d1a12a1](https://github.com/grund3g/agent-heaven/commit/d1a12a10efc8037bbdd9087f0352c41d9eb86b72))
* **integrate:** avoid unrelated commit message suggestions ([727fb80](https://github.com/grund3g/agent-heaven/commit/727fb8058ee46675a831f5b1b4917c4bad212faf))
* **jobs:** derive Done vs Needs Attention from agent hint ([875d374](https://github.com/grund3g/agent-heaven/commit/875d374b7f5c68108abec3b06ab6d9f63f18ace2))
* **renderer:** replace prompt() with dialog ([b933068](https://github.com/grund3g/agent-heaven/commit/b93306854f20267e78f90264d73f4d47207bdc77))

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
