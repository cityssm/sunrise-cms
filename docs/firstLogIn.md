[Home](https://cityssm.github.io/sunrise-cms/)
•
[Help](https://cityssm.github.io/sunrise-cms/docs/)

# Logging In for the First Time

**Active Directory** is the preferred method of authentication,
though a few others are available as well. The type of authentication
Sunrise CMS should use is defined in the [`config.js`](./configJs.md) file.

💡 Out of the box, Sunrise CMS does not record user passwords or hashes in the database.

## Main `config.js` Settings

There are two main setting blocks related to users, [one for authentication](#login-block),
the [other for permissions](#users-block).

💡 In Typescript environments, the configuration object can be tied to the
`Config` interface in
[`types/config.types.ts`](https://github.com/cityssm/sunrise-cms/blob/main/types/config.types.ts)
for help with configuration.

### `login` Block

The `login` block defines the method of authentication Sunrise CMS will use.
There are several methods available.

- [Active Directory](#active-directory-configuration)
- [AD Web Auth](#ad-web-auth-configuration)
- [Function based authentication](#function-based-authentication-configuration)
- [Plain text authentication](#plain-text-authentication-configuration)

### Active Directory Configuration

```javascript
config.login = {
  authentication: {
    type: 'activeDirectory',

    config: {
      url: 'ldap://auth.example.com',
      baseDN: 'dc=example,dc=com',

      bindUserDN: 'CN=serviceuser,OU=Service Accounts,DC=example,DC=com',
      bindUserPassword: 'p@ssw0rd'
    }
  },

  domain: 'example'
}
```

### AD Web Auth Configuration

[AD Web Auth](https://github.com/cityssm/ad-web-auth) is a simple web application
to assist with Active Directory authentication over HTTP, useful if the server
hosting Sunrise CMS does not have easy access to Active Directory.

```javascript
config.login = {
  authentication: {
    type: 'adWebAuth',

    config: {
      method: 'post',
      url: 'http://192.168.1.234:5678',

      userNameField: 'u',
      passwordField: 'p'
    }
  },
  domain: 'example'
}
```

### Function Based Authentication Configuration

Function based authentication puts you in charge of the authentication.
You implement your own logic. You can connect to your own database,
use your own API, or whatever other method you prefer.
**Always keep security in mind when building your `authenticate` function.**

💡 If your `authenticate` function is long, consider placing it in another file
and importing it.

```javascript
config.login = {
  authentication: {
    type: 'function',

    config: {
      authenticate(userName, password) {
        if (satisfiesAuthenticationLogic(userName, password)) {
          return true
        }

        return false
      }
    }
  },
  domain: 'example'
}
```

### Plain Text Authentication Configuration

⚠️ **Helpful for setup, but not recommened on an ongoing basis.**

```javascript
config.login = {
  authentication: {
    type: 'plainText',

    config: {
      users: {
        'example\\user1': 'p@ssw0rd1',
        'example\\user2': 'p@ssw0rd2'
      }
    }
  },
  domain: 'example'
}
```

## `users` Block

The `users` block is one way to define user permissions within Sunrise CMS,
and helpful for getting started or for smaller setups where users are not regularly
changing.

💡 User permissions can also be assigned within the Sunrise CMS interface itself
by an admin user.

```javascript
config.users = {
  canLogin: [
    'administrator',
    'officeUser',
    'cemeterySupervisor',
    'cemeteryWorker'
  ],

  canUpdateCemeteries: ['officeUser', 'cemeterySupervisor'],
  canUpdateContracts: ['officeUser'],
  canUpdateWorkOrders: ['officeUser', 'cemeterySupervisor', 'cemeteryWorker'],

  isAdmin: ['administrator']
}
```
