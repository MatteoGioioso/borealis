# Kubernetes deployments

## Dev environment

### Dependencies

- helm, golang, kubectl
- minica: `go install github.com/jsha/minica@latest`
- kind: [install](https://kind.sigs.k8s.io/docs/user/quick-start/#installing-from-release-binaries)

1. Change the variables at the top of the `dev.mk` according to your needs.

   ```shell
   DOCKER_HOST = # If you are using remote docker otherwise leave empty or remove
   HOSTNAME = # You can leave the default value
   HOST_IP = # The reachable IP of the host
   ```   

2. Setup `make dev`: it will create test certificates, setup variables and start a Kind cluster with a load balancer.
   If needed, add the callback to the SSO IDP: `https://<$HOSTNAME>:8443/borealis/identity/callback`.
   **This command should be run only the first time**
3. Add the fake `HOSTNAME` into your `/etc/hosts`: `make -f dev.mk setup.host`
4. Run `make -f dev.mk kind.create`. You need to have Kind installed.

# Admin

## Notes
 - When using helm, be aware that installing the new chart will not update the `Postgresql` and `OperatorConfiguration` CRD
 - The StatefulSet is replaced and a rolling updates is triggered if the following properties differ: 
   ```
   container: name, ports, image, resources, env, envFrom, securityContext, volumeMounts 
   template: labels, annotations, service account, securityContext, affinity, priority class and termination grace period
   
   ```
 - f