[Home](https://cityssm.github.io/sunrise-cms/)
•
[Help](https://cityssm.github.io/sunrise-cms/docs/)

# Regular Administrator Maintenance

Sunrise CMS is a self-hosted solution, which puts onus on the application administrator to maintain the installation.
There are a few things the administrator should do regularly to maintain a well-running instance.

## Backup the Application (or at least the `data` folder)

The `data` folder contains the application's configuration file, `config.js`.

The `data` folder also contains the application's database, `sunrise.db`,
and any backups generate by the application itself in the `backups` subfolder.

Depending on the configuration settings, the `data` folder may also include an `attachments` subfolder.

For the smoothest restore, backing up the config file, database, and attachments is a must!
