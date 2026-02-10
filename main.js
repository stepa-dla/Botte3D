const loadingOverlay = document.getElementById("loading");
const scanningOverlay = document.getElementById("scanning");
const startButton = document.getElementById("startButton");

let started = false;

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
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: "./assets/targets.mind",
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

    const loader = new THREE.GLTFLoader();
    const gltf = await loadGltf(loader, "./assets/model.glb");
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
    alert(
      "Failed to start AR. Make sure assets/model.glb and assets/targets.mind exist, then allow camera permission."
    );
  }
};

startButton.addEventListener("click", startAr);
