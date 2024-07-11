#!/bin/bash

dumps_dir_path=${PWD}/dumps

echo "Dumping Solana programs to ${dumps_dir_path}"

# Mpl Core program
if [ -e ${dumps_dir_path}/core.so ]
then
  echo "File core.so already exists"
  echo "skipped ⚠️"
else
  solana program dump -um CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d ${dumps_dir_path}/core.so
  if [ $? -eq 0 ] 
  then 
    echo "Successfully created file ✅" 
  else 
    echo "Error ❌" >&2 
  fi
fi

# candy_machine_core program
if [ -e ${dumps_dir_path}/candy_machine_core.so ]
then
  echo "File core.so already exists"
  echo "skipped ⚠️"
else
  solana program dump -um CMACYFENjoBMHzapRXyo1JZkVS6EtaDDzkjMrmQLvr4J ${dumps_dir_path}/candy_machine_core.so
  if [ $? -eq 0 ] 
  then 
    echo "Successfully created file ✅" 
  else 
    echo "Error ❌" >&2 
  fi
fi


# candy_guard program
if [ -e ${dumps_dir_path}/candy_guard.so ]
then
  echo "File candy_guard.so already exists"
  echo "skipped ⚠️"
else
  solana program dump -um CMAGAKJ67e9hRZgfC5SFTbZH8MgEmtqazKXjmkaJjWTJ ${dumps_dir_path}/candy_guard.so
  if [ $? -eq 0 ] 
  then 
    echo "Successfully created file ✅" 
  else 
    echo "Error ❌" >&2 
  fi
fi

