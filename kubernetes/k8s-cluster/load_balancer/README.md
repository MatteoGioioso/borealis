- The loadbalancer is needed for https, Spilo enforce HTTPS for PAM, without TLS PAM won't work
- `cert.pem` needs to have permission `777`
- To create a new certificate use minica: `minica --domains 'borealis' --ca-cert cert.pem --ca-key key.pem` and `cat cert.pem key.pem > cert.pem`