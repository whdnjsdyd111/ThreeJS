import * as THREE from "../three.module.js";
import { GUI } from "../dat.gui.module.js";

function main() {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ canvas });
    const gui = new GUI();

    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 4;

    const scene = new THREE.Scene();

    const objects = [];

    const loadManager = new THREE.LoadingManager();

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const loader = new THREE.TextureLoader(loadManager);
    const material = new THREE.MeshBasicMaterial({
        // color: 0xFF8844
        map: loader.load("./wall.jpg"),
    });
    const cube = new THREE.Mesh(cubeGeometry, material);
    objects.push(cube);
    scene.add(cube);

    const materials = [
        new THREE.MeshBasicMaterial({ map: loader.load("./flower-1.jpg") }),
        new THREE.MeshBasicMaterial({ map: loader.load("./flower-2.jpg") }),
        new THREE.MeshBasicMaterial({ map: loader.load("./flower-3.jpg") }),
        new THREE.MeshBasicMaterial({ map: loader.load("./flower-4.jpg") }),
        new THREE.MeshBasicMaterial({ map: loader.load("./flower-5.jpg") }),
        new THREE.MeshBasicMaterial({ map: loader.load("./flower-6.jpg") }),
    ];
    const loadingElem = document.querySelector("#loading");
    const progressBarElem = loadingElem.querySelector(".progressbar");

    loadManager.onLoad = () => {
        loadingElem.style.display = "none";
        const cube2 = new THREE.Mesh(cubeGeometry, materials);
        cube2.position.x = 2;
        objects.push(cube2);
        scene.add(cube2);
    };
    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
        const progress = itemsLoaded / itemsTotal;
        progressBarElem.style.transform = `scaleX(${progress})`;
    };

    function render(time) {
        time *= 0.001;

        objects.forEach((obj) => {
            obj.rotation.x = time;
            obj.rotation.y = time;
        });

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;

    if (needResize) {
        renderer.setSize(width, height, false);
    }

    return needResize;
}

main();
