#!/bin/sh
case "$1" in
    "production" ) forever start -a -l bodega-manager-production.log -o bodega-manager-production-out.log -e bodega-manager-production-error.log app.js;;
    "staging" ) forever start -a -l bodega-manager-test.log -o bodega-manager-test-out.log -e bodega-manager-test-error.log app.js;;
    * ) node app.js;;
esac
