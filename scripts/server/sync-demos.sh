#!/bin/bash
# Sync demos from home dir to /var/www (needs sudo)
rsync -av /home/sourav/apps/zorbit-platform/demos/ /var/www/zorbit-demos/
chown -R www-data:www-data /var/www/zorbit-demos/
echo "Done. Demos synced."
