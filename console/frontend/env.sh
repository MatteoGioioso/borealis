#!/usr/bin/env sh

# Add assignment
echo "window._env_ = {" > ./env-config.js

# Read each line in window.env file
# Each line represents key=value pairs
while read -r line || [ -n "$line" ];
do
  echo "$line"
  # Split env variables by character `=`
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
  fi

  # Read value of current variable if exists as Environment variable
  eval value=\"\$"$varname"\"
  # Otherwise use value from .env file
  [ -z "$value" ] && value=${varvalue}

  echo name: "$varname", value: "$value"

  # Append configuration property to JS file
  echo "  $varname: \"$value\"," >> ./env-config.js
done < window.env

echo "}" >> ./env-config.js