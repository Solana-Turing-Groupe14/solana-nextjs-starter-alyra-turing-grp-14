#!/bin/bash

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
validator_options=(-r )

solana-test-validator ${validator_options} \
  --bpf-program CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d ${dumps_dir_path}/core.so \
  --bpf-program CMACYFENjoBMHzapRXyo1JZkVS6EtaDDzkjMrmQLvr4J ${dumps_dir_path}/candy_machine_core.so \
  --bpf-program CMAGAKJ67e9hRZgfC5SFTbZH8MgEmtqazKXjmkaJjWTJ ${dumps_dir_path}/candy_guard.so


