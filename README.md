# Link Dashboard

A premium, glassmorphism-styled dashboard for managing links, designed for K3s.

## Features
- Add URLs with automatic icon fetching (via Google S2).
- Beautiful dark mode with glassmorphism UI.
- Persistent storage using SQLite (compatible with K3s PVC).
- Dockerized for easy deployment.

## Local Development

1. **Backend**:
   ```bash
   cd server
   npm install
   node index.js
   ```

2. **Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Access at `http://localhost:5173`.

## Docker Build

```bash
docker build -t link-dashboard:latest .
```

## K3s Deployment

1. If using local K3s/K3d, import the image:
   ```bash
   # For k3d
   k3d image import link-dashboard:latest -c <cluster-name>
   
   # For standard k3s (if using containerd directly)
   docker save link-dashboard:latest | sudo k3s ctr images import -
   ```

2. Apply Manifests:
   ```bash
   kubectl apply -f k3s/manifests.yaml
   ```

3. Access via Ingress (default port 80).
