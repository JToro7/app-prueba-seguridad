
```
app-prueba-seguridad
├─ .babelrc
├─ .eslintrc.json
├─ .husky
│  └─ _
│     ├─ applypatch-msg
│     ├─ commit-msg
│     ├─ h
│     ├─ husky.sh
│     ├─ post-applypatch
│     ├─ post-checkout
│     ├─ post-commit
│     ├─ post-merge
│     ├─ post-rewrite
│     ├─ pre-applypatch
│     ├─ pre-auto-gc
│     ├─ pre-commit
│     ├─ pre-merge-commit
│     ├─ pre-push
│     ├─ pre-rebase
│     └─ prepare-commit-msg
├─ .prettierrc
├─ app-prueba-seguridad.rar
├─ cypress
│  ├─ downloads
│  ├─ e2e
│  │  ├─ 01-authentication.cy.js
│  │  ├─ 02-api-security.cy.js
│  │  ├─ 03-user-interface.cy.js
│  │  └─ 04-oauth-google.cy.js
│  ├─ fixtures
│  │  ├─ test-data.json
│  │  └─ users.json
│  ├─ setup-cypress.js
│  └─ support
│     ├─ commands.js
│     └─ e2e.js
├─ cypress.config.js
├─ jest.config.js
├─ jest.setup.js
├─ package.json
├─ public
├─ README.md
├─ run-oauth-tests.js
├─ scripts
│  ├─ build.sh
│  └─ dev-setup.sh
├─ src
│  ├─ backend
│  │  ├─ config
│  │  │  └─ passport.js
│  │  ├─ controllers
│  │  │  ├─ admin.controller.js
│  │  │  ├─ auth.controller.js
│  │  │  └─ user.controller.js
│  │  ├─ middleware
│  │  │  ├─ auth.js
│  │  │  ├─ errorHandler.js
│  │  │  ├─ rateLimiter.js
│  │  │  └─ validation.js
│  │  ├─ routes
│  │  │  ├─ api.routes.js
│  │  │  └─ auth.routes.js
│  │  ├─ server.js
│  │  ├─ services
│  │  │  ├─ admin.service.js
│  │  │  ├─ auth.service.js
│  │  │  └─ user.service.js
│  │  └─ utils
│  │     └─ jwt.utils.js
│  ├─ frontend
│  │  ├─ css
│  │  │  └─ styles.css
│  │  ├─ index-original.html
│  │  ├─ index.html
│  │  └─ js
│  │     ├─ ApiClient.js
│  │     ├─ app.js
│  │     ├─ AuthClient.js
│  │     ├─ Components.js
│  │     └─ Config.js
│  └─ index.js
├─ tests
│  ├─ e2e
│  │  └─ smoke.test.js
│  ├─ integration
│  │  └─ auth-flow.test.js
│  └─ unit
│     ├─ auth.test.js
│     └─ user.test.js
└─ verify-oauth-config.js

```