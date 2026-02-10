import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MindARThree } from "mindar-image-three";

const loadingOverlay = document.getElementById("loading");
const tapToStartOverlay = document.getElementById("tapToStart");

const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const loadGltf = (loader, path) =>
  new Promise((resolve, reject) => {
    loader.load(path, resolve, undefined, reject);
  });

let arStarted = false;
async function startAR() {
  if (arStarted) return;
  arStarted = true;

  try {
    tapToStartOverlay.classList.add("hidden");
    loadingOverlay.classList.remove("hidden");

    const container = document.getElementById("container");
    const mindarThree = new MindARThree({
      container,
      imageTargetSrc: "./assets/targets.mind",
      uiLoading: "no",
      uiScanning: "no",
      uiError: "no",
      maxTrack: 1,
    });

    const { renderer, scene, camera } = mindarThree;
    // Transparent clear so camera feed (video layer) shows through on mobile
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 2, 2));
    const anchor = mindarThree.addAnchor(0);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.2);
    scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0.5, 1, 0.5);
    scene.add(dirLight);

    const loader = new GLTFLoader();

    // Start camera and load model in parallel so AR starts fast
    const [gltf] = await Promise.all([
      loadGltf(loader, "./assets/model.glb"),
      mindarThree.start(),
    ]);

    // iOS: video must play inside the same user gesture that started AR
    const video = container.querySelector("video");
    if (video) {
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.muted = true;
      video.playsInline = true;
      const playPromise = video.play();
      if (playPromise !== undefined) playPromise.catch(() => {});
    }

    const model = gltf.scene;
    const wrapper = new THREE.Group();
    wrapper.scale.set(0.8, 0.8, 0.8);
    wrapper.add(model);
    anchor.group.add(wrapper);

    loadingOverlay.classList.add("hidden");

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  } catch (error) {
    console.error("AR start failed:", error);
    arStarted = false;
    loadingOverlay.classList.add("hidden");
    tapToStartOverlay.classList.remove("hidden");
    const reason = error?.message || String(error);
    alert("Failed to start AR.\n\n" + reason);
  }
}

if (isIOS) {
  loadingOverlay.classList.add("hidden");
  tapToStartOverlay.classList.remove("hidden");
  tapToStartOverlay.addEventListener("click", startAR, { once: true });
  tapToStartOverlay.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      startAR();
    },
    { once: true, passive: false }
  );
} else {
  startAR();
}
