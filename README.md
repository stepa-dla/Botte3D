# MindAR QR Target App (GitHub Pages)

This project is a static MindAR web app that detects an image target (your QR code) and shows a 3D model (`.glb`) on top of it.

## 1) Add your files

Put these files in `assets/`:

- `model.glb` -> your 3D model
- `targets.mind` -> MindAR target database generated from your QR image

> Note: MindAR image tracking uses `.mind` files, not the raw QR image directly.

## 2) Create `targets.mind` from your QR image

1. Generate or export your QR code as a clear PNG.
2. Open the MindAR image compiler from the MindAR docs/tools.
3. Upload the QR PNG and download `targets.mind`.
4. Save it as `assets/targets.mind`.

## 3) Run locally

Because camera access requires HTTP/HTTPS (not `file://`), run a local server.

Example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## 4) Deploy to GitHub Pages

1. Push this project to GitHub.
2. In repository settings, open **Pages**.
3. Set source to **Deploy from a branch**.
4. Select branch `main` and folder `/ (root)`.
5. Save and wait for the published URL.

Your app entry point is `index.html`.

## Notes

- Use HTTPS on mobile devices for camera permission (GitHub Pages is HTTPS by default).
- The app starts AR after pressing **Start AR**.
- The first image target in `targets.mind` is used (`index 0`).
