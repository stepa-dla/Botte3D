import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MindARThree } from "mindar-image-three";

const loadingOverlay = document.getElementById("loading");

const loadGltf = (loader, path) =>
  new Promise((resolve, reject) => {
    loader.load(path, resolve, undefined, reject);
  });

(async () => {
  try {
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

    // Ensure camera video plays on iOS (black screen fix)
    const video = container.querySelector("video");
    if (video) {
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.muted = true;
      video.play().catch(() => {});
    }

    const model = gltf.scene;
    model.scale.set(0.2, 0.2, 0.2);
    model.position.set(0, 0, 0);
    anchor.group.add(model);

    loadingOverlay.classList.add("hidden");

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  } catch (error) {
    console.error("AR start failed:", error);
    loadingOverlay.classList.add("hidden");
    const reason = error?.message || String(error);
    alert("Failed to start AR.\n\n" + reason);
  }
})();
