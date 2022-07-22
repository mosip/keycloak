#!/usr/local/bin/python3
# Script to initialize values in Keycloak

import os
import sys
import ast
import argparse
import secrets
import json
import yaml
import traceback
from keycloak import KeycloakAdmin
from keycloak.exceptions import raise_error_from_response, KeycloakError, KeycloakGetError
from keycloak.connection import  ConnectionManager
from keycloak.urls_patterns import URL_ADMIN_USER_REALM_ROLES

class KeycloakSession:
    def __init__(self, realm, server_url, user, pwd, ssl_verify):
        self.keycloak_admin = KeycloakAdmin(server_url=server_url,
                                            username=user,
                                            password=pwd,
                                            realm_name=realm,
                                            verify=ssl_verify)
    def create_realm(self, realm, frontend_url=''):
        payload = {
            "realm" : realm,
            "enabled": True,
            "accessCodeLifespan": 7200,
            "accessCodeLifespanLogin": 1800,
            "accessCodeLifespanUserAction": 300,
            "accessTokenLifespan": 86400,
            "accessTokenLifespanForImplicitFlow": 900,
            "actionTokenGeneratedByAdminLifespan": 43200,
            "actionTokenGeneratedByUserLifespan": 300,
            "attributes": {"frontendUrl": frontend_url}
        }
        try:
            self.keycloak_admin.create_realm(payload, skip_exists=False)
        except KeycloakError as e:
            if e.response_code == 409:
                print('\tExists, updating %s' % realm)
                self.keycloak_admin.update_realm(realm, payload)
        except:
            raise

        return 0

    def delete_realm(self, realm, skip_exists=False):
        self.keycloak_admin.realm_name = realm  # work around because otherwise client was getting created in master
        url = 'admin/realms/'+realm
        payload = {
        }
        try:
            print('\tDeleting realm %s' % realm)
            data_raw = self.keycloak_admin.connection.raw_delete(url, data=json.dumps(payload))
            return raise_error_from_response(data_raw, KeycloakGetError, skip_exists=skip_exists)

        except KeycloakError as e:
            if e.response_code == 404:
                print('\tRealm %s does not exists; SKIPPING;' % realm)

        except:
            self.keycloak_admin.realm_name = 'master'  # restore
            raise

    def delete_client(self, realm, client, skip_exists=False):
        self.keycloak_admin.realm_name = realm  # work around because otherwise client was getting created in master
        try:
            print('\tDeleting client %s' % client)
            client_id = self.keycloak_admin.get_client_id(client)
            data_raw = self.keycloak_admin.delete_client(client_id)

        except KeycloakError as e:
            if e.response_code == 404:
                print('\tClient %s does not exists; SKIPPING;' % client)

        except:
            self.keycloak_admin.realm_name = 'master'  # restore
            raise

    # del_sa_roles: remove roles from service account user
    def remove_sa_roles(self, realm, client, del_sa_roles=None):
        self.keycloak_admin.realm_name = realm
        try:
            roles = []  # Get full role reprentation of all roles
            for role in del_sa_roles:
                print("\t\tRole : %s" % role)
                role_rep = self.keycloak_admin.get_realm_role(role)
                roles.append(role_rep)
            client_id = self.keycloak_admin.get_client_id(client)
            user = self.keycloak_admin.get_client_service_account_user(client_id)
            params_path = {"realm-name": self.keycloak_admin.realm_name, "id": user["id"]}
            self.keycloak_admin.raw_delete(URL_ADMIN_USER_REALM_ROLES.format(**params_path), data=json.dumps(roles))
        except:
            self.keycloak_admin.realm_name = 'master' # restore
            raise

        self.keycloak_admin.realm_name = 'master' # restore

    def delete_realm_role(self, realm, role, skip_exists=False):
        self.keycloak_admin.realm_name = realm
        try:
            print("\tRole : %s" % role)
            role_rep = self.keycloak_admin.get_realm_role(role)
            URL_ADMIN_REALM_ROLE = 'admin/realms/{realm-name}/roles-by-id/{id}'
            payload = {
            }
            params_path = {"realm-name": self.keycloak_admin.realm_name, "id": role_rep["id"]}
            data_raw = self.keycloak_admin.raw_delete(URL_ADMIN_REALM_ROLE.format(**params_path), data=json.dumps(payload))
            return raise_error_from_response(data_raw, KeycloakGetError, skip_exists=skip_exists)

        except KeycloakError as e:
            if e.response_code == 404:
                print('\tRole %s does not exists; SKIPPING;' % role)
        except:
            self.keycloak_admin.realm_name = 'master' # restore
            raise

        self.keycloak_admin.realm_name = 'master' # restore

    def create_role(self, realm, role):
        print('\tCreating role %s for realm %s' % (role, realm))
        self.keycloak_admin.realm_name = realm  # work around because otherwise role was getting created in master
        self.keycloak_admin.create_realm_role({'name' : role, 'clientRole' : False}, skip_exists=True)
        self.keycloak_admin.realm_name = 'master' # restore
        return 0

    # sa_roles: service account roles
    def create_client(self, realm, client, secret, sa_roles=None):
        self.keycloak_admin.realm_name = realm  # work around because otherwise client was getting created in master
        payload = {
          "clientId" : client,
          "secret" : secret,
          "standardFlowEnabled": True,
          "serviceAccountsEnabled": True,
          "directAccessGrantsEnabled": True,
          "redirectUris": ['*'],
          "authorizationServicesEnabled": True
        }
        try:
            print('\tCreating client %s' % client)
            self.keycloak_admin.create_client(payload, skip_exists=False)  # If exists, update. So don't skip
        except KeycloakError as e:
            if e.response_code == 409:
                print('\tExists, updating %s' % client)
                client_id = self.keycloak_admin.get_client_id(client)
                self.keycloak_admin.update_client(client_id, payload)
        except:
            self.keycloak_admin.realm_name = 'master' # restore
            raise

        if len(sa_roles) == 0:  # Skip the below step
            self.keycloak_admin.realm_name = 'master' # restore
            return

        try:
            roles = [] # Get full role reprentation of all roles 
            for role in sa_roles:
                role_rep = self.keycloak_admin.get_realm_role(role)
                roles.append(role_rep)
            client_id = self.keycloak_admin.get_client_id(client)
            user = self.keycloak_admin.get_client_service_account_user(client_id)
            params_path = {"realm-name": self.keycloak_admin.realm_name, "id": user["id"]}
            self.keycloak_admin.raw_post(URL_ADMIN_USER_REALM_ROLES.format(**params_path), data=json.dumps(roles))
        except:
            self.keycloak_admin.realm_name = 'master' # restore
            raise
        
        self.keycloak_admin.realm_name = 'master' # restore

    def create_mapper(self, realm, client, mapper, skip_exists=False):
        self.keycloak_admin.realm_name = realm  # work around because otherwise client was getting created in master
        client_id = self.keycloak_admin.get_client_id(client)
        mapper_url = 'admin/realms/'+realm+'/clients/'+client_id+'/protocol-mappers/models'
        payload = {
                        "protocol":"openid-connect",
                        "config": {
                            "id.token.claim":"true",
                            "access.token.claim":"true",
                            "userinfo.token.claim":"true",
                            "multivalued":"",
                            "aggregate.attrs":"",
                            "user.attribute":mapper['mapper_user_attribute'],
                            "claim.name":mapper['token_claim_name'],
                            "jsonType.label":"String"
                        },
                        "name":mapper['mapper_name'],
                        "protocolMapper":"oidc-usermodel-attribute-mapper"
                  }
        try:
            print('\tCreating Mapper %s' % mapper['mapper_name'])
            data_raw = self.keycloak_admin.connection.raw_post(mapper_url, data=json.dumps(payload))
            return raise_error_from_response(data_raw, KeycloakGetError, skip_exists=skip_exists)

        except KeycloakError as e:
            if e.response_code == 409:
                print('\tMapper %s Exists already exists; SKIPPING;' % mapper['mapper_name'])

        except:
            self.keycloak_admin.realm_name = 'master' # restore
            raise

    def create_user(self, realm, uname, email, fname, lname, password, temp_flag):
        self.keycloak_admin.realm_name = realm
        payload = {
          "username" : uname,
          "email" : email,
          "firstName" : fname,
          "lastName" : lname,
          "enabled": True
        }
        try:
            print('Creating user %s' % uname)
            self.keycloak_admin.create_user(payload, False) # If exists, update. So don't skip
            user_id = self.keycloak_admin.get_user_id(uname)
            self.keycloak_admin.set_user_password(user_id, password, temporary=temp_flag)
        except KeycloakError as e:
            if e.response_code == 409:
                print('Exists, updating %s' % uname)
                user_id = self.keycloak_admin.get_user_id(uname)
                self.keycloak_admin.update_user(user_id, payload)
        except:
            self.keycloak_admin.realm_name = 'master' # restore
            raise

        self.keycloak_admin.realm_name = 'master' # restore

    def assign_user_roles(self, realm, username, roles):
        self.keycloak_admin.realm_name = realm
        roles = [self.keycloak_admin.get_realm_role(role) for role in roles]
        try:
            print(f'''Get user id for {username}''')
            user_id = self.keycloak_admin.get_user_id(username)
            self.keycloak_admin.assign_realm_roles(user_id, roles)
        except:
            self.keycloak_admin.realm_name = 'master' # restore
            raise

        self.keycloak_admin.realm_name = 'master' # restore

def args_parse():
    parser = argparse.ArgumentParser()
    parser.add_argument('server_url', type=str, help='Full url to point to the server for auth: Eg. https://iam.xyz.com/auth/.  Note: slash is important')
    parser.add_argument('user', type=str, help='Admin user')
    parser.add_argument('password', type=str, help='Admin password')
    parser.add_argument('input_yaml', type=str, help='File containing input for roles and clients in YAML format')
    parser.add_argument('--disable_ssl_verify', help='Disable ssl cert verification while connecting to server', action='store_true')
    parser.add_argument('--frontend_url', help='Frontend URL', dest='frontend_url', action='store', default='')

    args = parser.parse_args()
    return args

def main():

    args =  args_parse()
    server_url = args.server_url
    user = args.user
    password = args.password
    input_yaml = args.input_yaml

    ssl_verify = True
    if args.disable_ssl_verify:
        ssl_verify = False

    fp = open(input_yaml, 'rt')
    values = yaml.load(fp, Loader=yaml.FullLoader)

    server_url = server_url + '/auth/' # Full url to access api

    try:
        print(server_url)
        ks = KeycloakSession('master', server_url, user, password, ssl_verify)
        for realm in values:
            if realm == "del_realms":
                print("Delete realms : ")
                for r in values[realm]:
                    ks.delete_realm(r)
                break

        print('Create realms :')
        for realm in values:
            if realm == "del_realms":
                continue
            print('\tCreate realms : %s' % realm)
            r = ks.create_realm(realm, args.frontend_url)  # {realm : [role]}

        for realm in values:
            roles = []
            if 'roles' in values[realm]:
                print('Create roles for realm %s' % realm)
                roles = values[realm]['roles']
            for role in roles:
                r = ks.create_role(realm, role)

            del_roles = []
            if 'del_roles' in values[realm]:
                print('Delete roles for realm %s' % realm)
                del_roles = values[realm]['del_roles']
            for role in del_roles:
                r = ks.delete_realm_role(realm, role)
            del_clients = []
            if 'del_clients' in values[realm]:
                print("Deleting clients for realm %s" % realm)
                del_clients = values[realm]['del_clients']
            for client in del_clients:
                r = ks.delete_client(realm, client)

            # Expect secrets passed via env variables.
            clients = []
            if 'clients' in values[realm]:
                print('Create clients for realm %s' % realm)
                clients = values[realm]['clients']
            for client in clients:
                secret_env_name = '%s_secret' % client['name']
                secret_env_name = secret_env_name.replace('-', '_') # Compatible with environment variables
                secret = os.environ.get(secret_env_name)
                if secret is None:  # Env variable not found
                    print('\tSecret environment variable %s not found, generating' % secret_env_name)
                    secret = secrets.token_urlsafe(16)

                if 'saroles' in client:
                    r = ks.create_client(realm, client['name'], secret, client['saroles'])

                if 'del_saroles' in client:
                    print("\tRemoving roles from service account user for client %s" % client['name'])
                    r = ks.remove_sa_roles(realm, client['name'], client['del_saroles'])

                if 'mappers' in client:
                    mappers = client['mappers']
                    print("\tCreating mappers for %s client " % client['name'])
                    for mapper in mappers:
                        r = ks.create_mapper(realm, client['name'], mapper)
            users = []
            if 'users' in values[realm]:
                users = values[realm]['users']
            for user in users:
                print(f'''Creating user {user['username']}''')
                r = ks.create_user(realm, user['username'], user['email'], user['firstName'], user['lastName'], user['password'], user['temporary'])
                r = ks.assign_user_roles(realm, user['username'], user['realmRoles'])
    except:
        formatted_lines = traceback.format_exc()
        print(formatted_lines)
        sys.exit(1)

    sys.exit(r)

if __name__=="__main__":
    main()
