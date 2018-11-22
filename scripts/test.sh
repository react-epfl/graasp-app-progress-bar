#!/bin/bash

# fail the build on any failed command
set -e

# if build has already been approved, skip tests
if [ ${CI_BUILD_APPROVED} == 'true' ]; then
  echo "build already approved, skipping tests"
  exit 0
fi

# start server
yarn start &

# wait until server is up
sleep 10

# run tests
yarn test
TEST_EXIT_CODE=$?

# return the exit code of the tests
exit ${TEST_EXIT_CODE}
