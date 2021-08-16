import * as THREE from "../three.module.js";
import { GUI } from "../dat.gui.module.js";
import { OrbitControls } from "../OrbitControls.js";

class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
        this.minDif = minDif;
    }
    get min() {
        return this.obj[this.minProp];
    }
    set min(v) {
        this.obj[this.minProp] = v;
        this.obj[this.maxProp] = Math.max(
            this.obj[this.maxProp],
            v + this.minDif
        );
    }
    get max() {
        return this.obj[this.maxProp];
    }
    set max(v) {
        this.obj[this.maxProp] = v;
        this.min = this.min; // min setter로 작동
    }
}

function main() {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ canvas });
    const gui = new GUI();

    const scene = new THREE.Scene();

    {
        {
            const planeSize = 40;

            const loader = new THREE.TextureLoader();
            const texture = loader.load("./tile.png");
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.magFilter = THREE.NearestFilter;
            const repeats = planeSize / 2;
            texture.repeat.set(repeats, repeats);

            const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
            // const planeMat = new THREE.MeshPhongMaterial({
            const planeMat = new THREE.MeshStandardMaterial({
                map: texture,
                side: THREE.DoubleSide,
            });
            const planeMesh = new THREE.Mesh(planeGeo, planeMat);
            planeMesh.rotation.x = Math.PI * -0.5;
            scene.add(planeMesh);
        }
        {
            const sphereRadius = 3;
            const sphereWidthDivisions = 32;
            const sphereHeightDivisions = 16;
            const sphereGeo = new THREE.SphereGeometry(
                sphereRadius,
                sphereWidthDivisions,
                sphereHeightDivisions
            );
            const numSphere = 20;
            for (let i = 0; i < numSphere; ++i) {
                const sphereMat = new THREE.MeshPhongMaterial();
                sphereMat.color.setHSL(i * 0.73, i, 0.5);
                const mesh = new THREE.Mesh(sphereGeo, sphereMat);
                mesh.position.set(
                    -sphereRadius - 1,
                    sphereRadius + 2,
                    i * sphereRadius * -2.2
                );
                scene.add(mesh);
            }
        }
        {
            const color = 0xffffff;
            const intensity = 1;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(0, 10, 0);
            light.target.position.set(-5, 0, 0);
            scene.add(light);
            scene.add(light.target);
        }
    }

    function updateCamera() {
        camera.updateProjectionMatrix();
    }

    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 50;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);

    gui.add(camera, "fov", 1, 180).onChange(updateCamera);
    const minMaxGUIHelper = new MinMaxGUIHelper(camera, "near", "far", 0.1);
    gui.add(minMaxGUIHelper, "min", 0.00001, 50, 0.00001)
        .name("near")
        .onChange(updateCamera);
    gui.add(minMaxGUIHelper, "max", 0.1, 100, 0.1)
        .name("far")
        .onChange(updateCamera);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

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
}

main();
