[Home](https://cityssm.github.io/sunrise-cms/)
•
[Help](https://cityssm.github.io/sunrise-cms/docs/)

# Installation

While the Sunrise Cemetery Management System (CMS) can run on a high end server,
that is by no means a requirement.
Most user workstations are sufficient for modest installations.

## Minimum Requirements

The system must meet the minimum requirements for Node.js,
which is able to run on budget hardware.

_More is better_ 💪, however under stress tests,
the application peaked at the following:

- x64 architecture.
- 2 GB of RAM.
- 1 GB of storage for application, dependencies, and data.
  More if you intend to store attachments.

### Recommended Requirements

- Active Directory for authentication.

## Step 1: Install Node.js 20 or better and npm

[Node.js](https://nodejs.org) is a JavaScript runtime environment.
Sunrise CMS is built to run on Node.js, and is regularly tested on the currently supported LTS versions.

[npm](https://www.npmjs.com/) is a package manager that contains all the prerequisites
for Sunrise CMS.

Node.js can run on Windows, Mac, and Linux.
Installers on the [Node.js website](https://nodejs.org) include npm.
Node.js and npm are also available in most package managers.

    > sudo apt install nodejs
    > sudo apt install npm

## Step 2: Download Sunrise CMS

### Download a release

**For production environments, using releases is recommended.**
[Releases are available on GitHub](https://github.com/cityssm/sunrise-cms/releases).

### Download using git

_Note that git downloads may contain incomplete features that are still under development._

[Git](https://git-scm.com/) is the version control system that manages the
code for Sunrise CMS.

Git can run on Windows, Mac, and Linux.
You can install it using an installer from the [Git website](https://git-scm.com/),
or from most package managers.

    > sudo apt install git

Once git is ready, open a command line, and navigate to the folder where the application will reside.

    > git clone https://github.com/cityssm/sunrise-cms

## Step 3: Install the dependencies

    > cd sunrise-cms
    > npm install

In a perfect world, all of the dependencies will install successfully. There are however a couple dependencies
that are occasionally difficult, depending on the platform you are installing on.
If an error occurs during the install, the first recommendation is to delete the `node_modules` folder,
and rerun `npm install`. If errors persist, here are the more common ones and their fixes.

### Error Installing `better-sqlite3`

On some platforms, the `better-sqlite3` needs to compile itself. When that is the case,
it uses Python to do so. If compilation is necessary and Python is unavailable, the installation will fail.

See the
[common troubleshooting steps for `better-sqlite3`](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md)
for more troubleshooting steps.

### Error Installing `puppeteer`

Puppeteer is used by Sunrise CMS to generate PDFs.
Installation may fail on platforms that no longer support the current versions of Google Chrome and Mozilla Firefox.
Installation may also fail if the platform is missing certain system packages that are required by
the web browsers. This issue is more common on Linux platforms that lack a desktop environment.

See the [system requirements for Puppeteer](https://pptr.dev/guides/system-requirements)
for Puppeteer's requirements, and the requirements of the browsers it uses.

## Step 4: Create a `config.js` file

It is recommended to copy the `testing.config.js` file to get started.

    > cp data/testing.config.js data/config.js

See the [config.js documentation](configJs.md) for help customizing
your configuration.

## Step 5: Start the application

**Start Using npm**

    > npm start

**Start Using node**

    > node ./bin/www.js

**Start as a Windows Service**

The included `windowsService-install.bat` script simplifies
the process of keeping the application running in a Windows environment
by creating a service that can start with the hosting server.

    > windowsService-install

## Step 5a: The application won't start!

If the application won't start, it can be run with debug output using the following command.

    > npm run dev:live
