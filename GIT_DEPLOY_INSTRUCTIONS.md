# Deployment Guide: Git & ArgoCD

This guide explains how to push your code to Git and configure K3s (via ArgoCD) to pull from it.

## 1. Initialize Git

Open a terminal in the `link-dashboard` folder:

```bash
git init
git add .
git commit -m "Initial commit: All Check List Dashboard"
```

## 2. Push to Remote Repository

Replace `<YOUR_GIT_URL>` with your actual repository URL (e.g., GitHub, GitLab).
The user mentioned `tfac-frontend-Infra-allapp/pord`. Assuming `pord` is the branch:

```bash
# Add remote
git remote add origin https://github.com/<YOUR_USERNAME>/tfac-frontend-Infra-allapp.git

# Create and push to 'pord' branch
git checkout -b pord
git push -u origin pord
```

## 3. Configure K3s to Pull from Git (ArgoCD)

If you have ArgoCD installed on your K3s cluster, apply the generated application manifest.

**Prerequisite**: You must have built and pushed the docker image to a registry that your K3s cluster can access, OR be using local images.
*Note: Since K3s pulls manifests from Git, the manifests must point to an image. If you are using local images, ensure `imagePullPolicy: IfNotPresent` is set (it is by default in this project).*

Apply the ArgoCD application:

```bash
kubectl apply -f k3s/argocd-app.yaml
```

This will tell ArgoCD to:
1.  Monitor the `tfac-frontend-Infra-allapp` repository.
2.  Look at the `pord` branch.
3.  Sync the manifests inside the `k3s/` folder.
