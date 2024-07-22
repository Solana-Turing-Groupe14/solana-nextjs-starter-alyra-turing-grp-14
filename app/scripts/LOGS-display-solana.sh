#!/bin/bash

logs_option_verbose=-v
logs_options="$logs_option_verbose"

logs_uri=localhost

echo "Starting the logs with the following options:" $logs_options

solana logs --url $logs_uri $logs_options