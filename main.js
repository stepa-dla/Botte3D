const loadingOverlay = document.getElementById("loading");
const scanningOverlay = document.getElementById("scanning");
const startButton = document.getElementById("startButton");

let started = false;

const resolveAssetUrl = (relativePath) =>
  new URL(relativePath, window.location.href).toString();

const ensureAssetReachable = async (url, label) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${label} not found (${response.status}) at ${url}`);
  }
};

const loadGltf = (loader, path) =>
  new Promise((resolve, reject) => {
    loader.load(path, resolve, undefined, reject);
  });

const startAr = async () => {
  if (started) {
    return;
  }
  started = true;
  startButton.disabled = true;
  startButton.textContent = "Starting...";

  try {
    const targetsUrl = resolveAssetUrl("./assets/targets.mind");
    const modelUrl = resolveAssetUrl("./assets/model.glb");

    await ensureAssetReachable(targetsUrl, "targets.mind");
    await ensureAssetReachable(modelUrl, "model.glb");

    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: targetsUrl,
      uiLoading: "#loading",
      uiScanning: "#scanning",
      uiError: "no",
      maxTrack: 1
    });

    const { renderer, scene, camera } = mindarThree;
    const anchor = mindarThree.addAnchor(0);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.2);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0.5, 1, 0.5);
    scene.add(dirLight);

    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");

    const loader = new THREE.GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    const gltf = await loadGltf(loader, modelUrl);
    const model = gltf.scene;

    model.scale.set(0.2, 0.2, 0.2);
    model.position.set(0, 0, 0);
    anchor.group.add(model);

    await mindarThree.start();
    loadingOverlay.classList.add("hidden");
    scanningOverlay.classList.remove("hidden");

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    startButton.textContent = "AR Running";
  } catch (error) {
    console.error("AR start failed:", error);
    loadingOverlay.classList.add("hidden");
    scanningOverlay.classList.add("hidden");
    startButton.disabled = false;
    startButton.textContent = "Start AR";
    started = false;
    const reason = error && error.message ? error.message : String(error);
    alert(`Failed to start AR.\n\nReason: ${reason}`);
  }
};

startButton.addEventListener("click", startAr);
