#!/bin/bash

# Load configuration variables
source local.env

function usage() {
  echo -e "Usage: $0 [--install,--uninstall,--env]"
}

function install() {
  # Exit if any command fails
  set -e

  echo -e "Installing OpenWhisk actions, triggers, and rules for openwhisk-serverless-apis..."

  echo -e "Setting IBM Cloud credentials and logging in to provision API Gateway"

  ibmcloud login \
    -u $IBM_CLOUD_USERNAME \
    -p $IBM_CLOUD_PASSWORD \
    -o $IBM_CLOUD_ORGANIZATION \
    -s $IBM_CLOUD_SPACE

  echo -e "\n"

  echo "Creating a package (here used as a namespace for shared environment variables)"
  ibmcloud fn package create pet \
    --param "CLOUDANT_URL" $CLOUDANT_URL \
    --param "CLOUDANT_IAM_API_KEY" $CLOUDANT_IAM_API_KEY \
    --param "CLOUDANT_DB_NAME" $CLOUDANT_DB_NAME

  echo -e "\n"

  echo "Installing POST Pet Action"
  cd actions/pet-post-action
  yarn install
  zip -rq action.zip *
  ibmcloud fn action create pet/pet-post action.zip \
    --kind nodejs:12 \
    --web true
  cd ../..

  echo -e "Install Complete"
}

function uninstall() {
  echo -e "Uninstalling..."

  echo "Removing actions..."
  ibmcloud fn action delete pet/pet-post

  echo "Removing package..."
  ibmcloud fn package delete pet

  echo -e "Uninstall Complete"
}

function showenv() {
  echo -e IBM_CLOUD_USERNAME="$IBM_CLOUD_USERNAME"
  echo -e IBM_CLOUD_PASSWORD="$IBM_CLOUD_PASSWORD"
  echo -e IBM_CLOUD_ORGANIZATION="$IBM_CLOUD_ORGANIZATION"
  echo -e IBM_CLOUD_SPACE="$IBM_CLOUD_SPACE"

  echo -e CLOUDANT_URL="$CLOUDANT_URL"
  echo -e CLOUDANT_IAM_API_KEY="$CLOUDANT_IAM_API_KEY"
  echo -e CLOUDANT_DB_NAME="$CLOUDANT_DB_NAME"
}

case "$1" in
"--install" )
install
;;
"--uninstall" )
uninstall
;;
"--env" )
showenv
;;
* )
usage
;;
esac
