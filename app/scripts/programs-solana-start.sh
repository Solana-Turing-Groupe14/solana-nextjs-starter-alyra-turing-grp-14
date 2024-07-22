#!/bin/bash

# if [ -z "$1" ]; then
#   echo "Usage: $0 <reset> or $0 <no-reset>"
#   exit 1
# fi

dumps_dir_path=${PWD}/dumps

if [[ ! -f ${dumps_dir_path}/core.so \
          || ! -f ${dumps_dir_path}/candy_machine_core.so \
          || ! -f ${dumps_dir_path}/candy_guard.so ]]; then
        echo "Missing files ⚠️ ..."
        printf "Script ended ❌"
        exit 1
fi 

solana config get

# solana config set --url http://127.0.0.1:8899

#--ledger /path/to/custom/ledger
# Reset the ledger
validator_option_reset=--reset
#validator_option_help=--help

#validator_options="$validator_option_help $validator_option_reset"
#validator_options="$validator_option_reset"

if [ "$1" == "reset" ]; then
  validator_options="$validator_option_reset"
elif [ "$1" == "no-reset" ]; then
  validator_options=""
else
  echo "Usage: $0 <reset> or $0 <no-reset>"
  exit 1
fi

echo "Starting the validator with the following options:" $validator_options

#exit 0



# doc https://solana.com/developers/guides/getstarted/solana-test-validator
solana-test-validator $validator_options \
  --bpf-program CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d ${dumps_dir_path}/core.so \
  --bpf-program CMACYFENjoBMHzapRXyo1JZkVS6EtaDDzkjMrmQLvr4J ${dumps_dir_path}/candy_machine_core.so \
  --bpf-program CMAGAKJ67e9hRZgfC5SFTbZH8MgEmtqazKXjmkaJjWTJ ${dumps_dir_path}/candy_guard.so


