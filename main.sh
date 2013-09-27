#!/bin/sh
case "$1" in
    "production" ) forever start -a -l bodega-manager-production.log -o bodega-manager-production-out.log -e bodega-manager-production-error.log app.js;;
               * ) node app.js;;
esac
