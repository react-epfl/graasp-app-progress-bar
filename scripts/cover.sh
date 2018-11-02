#!/bin/bash

# fail the build on any failed command
set -e

# start server with coverage flag set
yarn start:test &
PID=$!

# wait until server is up
sleep 10

# run tests
yarn test:ci
TEST_EXIT_CODE=$?

# report coverage
yarn report

# return the exit code of the test command
exit ${TEST_EXIT_CODE}
