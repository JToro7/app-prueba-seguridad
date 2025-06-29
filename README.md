
```
app-prueba-seguridad
├─ cypress
│  ├─ e2e
│  │  ├─ auth.cy.js
│  │  ├─ performance.cy.js
│  │  └─ protected-routes.cy.js
│  ├─ fixtures
│  │  └─ users.json
│  └─ support
│     ├─ commands.js
│     └─ e2e.js
├─ package-lock.json
├─ package.json
├─ public
├─ src
│  ├─ backend
│  │  ├─ config
│  │  │  └─ passport.js
│  │  ├─ controllers
│  │  │  ├─ auth.controller.js
│  │  │  └─ user.controller.js
│  │  ├─ middleware
│  │  │  ├─ auth.middleeare.js
│  │  │  ├─ error.hander.js
│  │  │  ├─ rateLimiter.js
│  │  │  └─ validation.js
│  │  ├─ routes
│  │  │  ├─ api.routes.js
│  │  │  └─ auth.routes.js
│  │  ├─ server.js
│  │  ├─ services
│  │  │  ├─ auth.service.js
│  │  │  └─ user.service.js
│  │  └─ utils
│  │     └─ jwt.utils.js
│  └─ frontend
│     ├─ css
│     │  └─ styles.css
│     ├─ index-original.html
│     ├─ index.html
│     └─ js
│        ├─ ApiClient.js
│        ├─ app.js
│        ├─ AuthClient.js
│        ├─ Components.js
│        └─ Config.js
└─ tests
   ├─ e2e
   ├─ integration
   └─ unit

```
```
app-prueba-seguridad
├─ cypress
│  ├─ e2e
│  │  ├─ auth.cy.js
│  │  ├─ performance.cy.js
│  │  └─ protected-routes.cy.js
│  ├─ fixtures
│  │  └─ users.json
│  └─ support
│     ├─ commands.js
│     └─ e2e.js
├─ package-lock.json
├─ package.json
├─ public
├─ README.md
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
│  │  │  ├─ auth.middleware.js
│  │  │  ├─ error.handler.js
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
└─ tests
   ├─ e2e
   │  └─ smoke.test.js
   ├─ integration
   │  └─ auth-flow.test.js
   └─ unit
      ├─ auth.test.js
      └─ user.test.js

```