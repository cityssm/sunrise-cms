[Home](https://cityssm.github.io/sunrise-cms/)
•
[Help](https://cityssm.github.io/sunrise-cms/docs/)

# config.js

Low level configuration is done using the required `data/config.js` file.
The available properties are defined below.

💡 Note that any changes to settings in the `config.js` file
require an application restart to take effect.

💡 In Typescript environments, the configuration object can be tied to the
`Config` interface in
[`types/config.types.ts`](https://github.com/cityssm/sunrise-cms/blob/main/types/config.types.ts)
for help with configuration.

Another way to help with configuration is by importing one of the
partial configurations in the
[`data/partialConfigs`](https://github.com/cityssm/sunrise-cms/tree/main/data/partialConfigs)
folder. For example, if you are setting up an instance of Sunrise CMS for
a cemetery in Ontario Canada, some configuration can be imported from
[`data/partialConfigs/ontario.partialConfig.js`](https://github.com/cityssm/sunrise-cms/blob/main/data/partialConfigs/ontario.partialConfig.js).

As a starting point, it is recommended to import
[`data/partialConfigs/partialConfig.js`](https://github.com/cityssm/sunrise-cms/blob/main/data/partialConfigs/partialConfig.js).

## Sample Configuration File

A simple `config.js` file may look like the following.

```javascript
import { config as partialConfig } from './partialConfigs/ontario.partialConfig.js'

export const config = Object.assign({}, partialConfig)

// Method to authenticate users
config.login = {
  authentication: {
    type: 'activeDirectory',

    config: {
      url: 'ldap://example.com',
      baseDN: 'dc=example,dc=com',

      bindUserDN: 'CN=service.acct,OU=Accounts,DC=example,DC=com',
      bindUserPassword: 'p@ssword'
    }
  },

  domain: 'example'
}

config.users = {
  canLogin: ['administrator', 'readOnlyUser', 'updateUser'],
  canUpdate: ['updateUser'],
  isAdmin: ['administrator']
}

// Required final default export
export default config
```

A sample working configuration file is available in
[`data/testing.config.js`](https://github.com/cityssm/sunrise-cms/blob/main/data/testing.config.js).

## Application Configuration

```typescript
application: {
  applicationName?: string    // Defaults to 'Sunrise CMS'
  httpPort?: number

  application

  backgroundUrl?: string      // Shown on login
  logoUrl?: string

  maximumProcesses?: number

  useTestDatabases?: boolean

  attachmentsPath?: string       // The folder to save files to
  maxAttachmentFileSize?: number // In megabytes
}
```

## Session Configuration

Manages user session settings.

```typescript
session: {
  cookieName?: string
  maxAgeMillis?: number
  secret?: string

  doKeepAlive?: boolean  // Whether or not to attempt to keep sessions active
}
```

## Reverse Proxy Configuration

Controls reverse proxy behavior.

```typescript
reverseProxy: {
  disableCompression?: boolean   // Disable response compression
  disableEtag?: boolean          // Disable ETag headers
  disableRateLimit?: boolean     // Disable rate limiting
  trafficIsForwarded?: boolean   // Whether or not traffic is forwarded
  urlPrefix?: string             // URL prefix for the application
}
```

## Login Configuration

For examples, see the [`login` block section of "Logging In for the First Time"](./firstLogIn.md#login-block).

```typescript
login: {
  authentication: {
    type: 'activeDirectory' | 'adWebAuth' | 'function' | 'plainText'
    config: AuthenticatorConfiguration
  }
  domain: string
}
```

## User Configuration

Controls user permissions and access levels.

User permissions can also be managed in Sunrise CMS itself.
Permissions managed there are recorded in the database.

For examples, see the [`users` block section of "Logging in for the First Time"](./firstLogIn.md#users-block).

```typescript
users: {
  // Users who can log in
  canLogin?: string[]

  // Users who can update all types of records
  // (cemeteries, contracts, and work orders)
  canUpdate?: string[]

  // Users who can update cemeteries and burial sites
  canUpdateCemeteries?: string[]

  // Users who can update contracts and funeral homes
  canUpdateContracts?: string[]

  // Users who can update work orders
  canUpdateWorkOrders?: string[]

  // Administrative users
  isAdmin?: string[]
}
```
