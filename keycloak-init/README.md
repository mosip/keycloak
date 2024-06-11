# Keycloak Init

## Context

After Keycloak is installed, it needs to be populated with base data that is needed for MOSIP.  The script and docker created here provide this function.  The script may be run standalone or as a docker. 

## Prerequisites
* Keycloak server must be running and available via a url like `https://iam.xyz.net`.
* Updated `input.yaml` file (an example is given here).
* Install utilities
* Install python3 virtual environment  and activate the same as per the link https://packaging.python.org/guides/installing-using-pip-and-virtual-environments/


```
$ pip3 install -r requirements.txt
```

## Script
* Help
```
$ python3 keycloak_init.py --help
```
* Run (example):
```
$ python3 keycloak_init.py https://iam.xyz.net user user password input.yaml
```

# Docker
* Create
```
$ docker build -t <your docker registry >/keycloak-init:<tag> .
$ docker push <your docker registry >/keycloak-init:<tag>
```
* Run

See `run.sh`

To just create users see example `users.yaml`

# Theme
Keycloak will feature the Mosip theme as the default theme. To apply a customized theme, please follow these steps:
* Log in to Keycloak.
* Navigate to the MOSIP realm settings.
* Goto Themes section and from the theme dropdown menu, choose the desired theme.

Note: We are adding theme as a part of keycloak_init

# Keycloak Client Roles Assignment 
This "assign_client_roles_to_user" method within the script is designed to assign client roles to a user in a specified realm using the Keycloak admin API. This method handles retrieving the user ID based on the username, fetching the client ID, and assigning the specified roles to the user.

## Parameters
- realm: The Keycloak realm where the user exists.
- username: The username of the user to whom the roles will be assigned.
- client: The client ID or client name in Keycloak.
- client_roles: A list of client roles to be assigned to the user.

 ## Error Handling
 If any error occurs during the process, the method will restore the Keycloak admin client's realm name to 'master' 
and re-raise the exception. This ensures that the client's state is consistent even in case of errors.

 ## Notes
 - Ensure that the username provided is unique to avoid unexpected behavior.
 - This script assumes that the roles provided in client_roles exist in the specified client.
 - The Keycloak server URL, admin credentials, and other parameters should be configured as per your Keycloak setup.
