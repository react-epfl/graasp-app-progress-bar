#!/bin/bash

# fail the build on any failed command
set -e

usage() {
    echo "usage: $0 [-e <path/to/file>] [-v <version string>] [-p] [-b <path/to/build>]" 1>&2
    exit 1
}

# default version
VERSION="latest"

# default build directory
BUILD="build/"

# validates versioning e.g. 0.0.1
validate_version() {
    # regex matching version numbers
    rx='^([0-9]+\.){0,2}(\*|[0-9]+)$'
    if [[ $1 =~ $rx ]]; then
        echo "info: validated version $1"
        VERSION=$1
    else
        echo "error: unable to validate version '$1'" 1>&2
        echo "format is '${rx}'"
        exit 1
    fi
}


# validates that environment file exists
validate_env() {
    if [ -f $1 ]; then
        echo "info: validated environment file $1"
        source ${1}
    else
        echo "error: environment file '$1' does not exist" 1>&2
        exit 1
    fi
}

# validates that build directory exists
validate_build() {
    if [ -d $1 ]; then
        echo "info: validated build directory $1"
        BUILD=$1
    else
        echo "error: build directory '$1' does not exist" 1>&2
        exit 1
    fi
}


# parse command line arguments
while getopts ":e:v:b:" opt; do
  case ${opt} in
    e)
        e=${OPTARG}
        validate_env ${e}
        ;;
    v)
        v=${OPTARG}
        validate_version ${v}
        ;;
    b)
        b=${OPTARG}
        validate_build ${b}
        ;;
    \?)
        echo "error: invalid option '-$OPTARG'" 1>&2
        exit 1
        ;;
  esac
done

# ensure the correct variables are defined
if [ -z "${GRAASP_DEVELOPER_ID}" ] || [ -z "${GRAASP_APP_ID}" ] || [ -z "${BUCKET}" ] || [ -z "${DISTRIBUTION}" ]; then
    echo "error: environment variables GRAASP_DEVELOPER_ID and/or GRAASP_APP_ID are not defined" 1>&2
    echo "error: you can specify them through a .env file in the app root folder" 1>&2
    echo "error: or through another file specified with the -e flag" 1>&2
    exit 1
fi

echo "info: publishing app ${GRAASP_APP_ID} version ${VERSION}"

PATH=${GRAASP_DEVELOPER_ID}/${GRAASP_APP_ID}/${VERSION}

# sync to s3
aws s3 sync ${BUILD} s3://${BUCKET}/${PATH} --delete

# invalidate cloudfront distribution
aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION} --paths /${PATH}
