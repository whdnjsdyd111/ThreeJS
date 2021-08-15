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
    const view1Elem = document.querySelector("#view1");
    const view2Elem = document.querySelector("#view2");
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
            const cubeSize = 4;
            const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
            // const cubeMat = new THREE.MeshPhongMaterial({ color: "#8AC" });
            const cubeMat = new THREE.MeshStandardMaterial({ color: "#8AC" });
            const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
            cubeMesh.position.set(cubeSize + 1, cubeSize / 2, 0);
            scene.add(cubeMesh);
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
            const sphereMat = new THREE.MeshStandardMaterial({ color: "#ca8" });
            const mesh = new THREE.Mesh(sphereGeo, sphereMat);
            mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
            scene.add(mesh);
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

    /*
    function updateCamera() {
        camera.updateProjectionMatrix();
    }
    */

    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 50;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);

    const cameraHelper = new THREE.CameraHelper(camera);
    scene.add(cameraHelper);

    // gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
    gui.add(camera, "fov", 1, 180);
    const minMaxGUIHelper = new MinMaxGUIHelper(camera, "near", "far", 0.1);
    // gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
    // gui.add(minMaxGUIHelper, "max", 0.1, 50, 0.1).name("far").onChange(updateCamera);
    gui.add(minMaxGUIHelper, "min", 0.1, 50, 0.1).name("near");
    gui.add(minMaxGUIHelper, "max", 0.1, 50, 0.1).name("far");

    const controls = new OrbitControls(camera, view1Elem);
    controls.target.set(0, 5, 0);
    controls.update();

    const camera2 = new THREE.PerspectiveCamera(60, 2, 0.1, 500);
    camera2.position.set(40, 10, 30);
    camera2.lookAt(0, 5, 0);

    const controls2 = new OrbitControls(camera2, view2Elem);
    controls2.target.set(0, 5, 0);
    controls2.update();

    function render() {
        /*
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        */

        resizeRendererToDisplaySize(renderer);

        // 가위 활성화
        renderer.setScissorTest(true);

        // 기존 화면 렌더링
        {
            const aspect = setScissorForElement(view1Elem);

            // 비율에 따라 카메라 조정
            camera.aspect = aspect;
            camera.updateProjectionMatrix();
            cameraHelper.update();

            // 기존 화면에서 가이드라인(CameraHelper)이 노출되지 않도록 설정
            cameraHelper.visible = false;

            scene.background = 0x000000;

            // 렌더링
            renderer.render(scene, camera);
        }

        // 두 번째 카메라 렌더링
        {
            const aspect = setScissorForElement(view2Elem);

            // 비율에 따라 카메라 조정
            camera2.aspect = aspect;
            camera2.updateProjectionMatrix();

            // 가이드라인 활성화
            cameraHelper.visible = true;

            scene.background = 0x000040;

            renderer.render(scene, camera2);
        }

        // renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    function setScissorForElement(elem) {
        const canvasRect = canvas.getBoundingClientRect();
        const elemRect = elem.getBoundingClientRect();

        // 캔버스에 대응하는 사각형 구하기
        const right =
            Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
        const left = Math.max(0, elemRect.left - canvasRect.left);
        const bottom =
            Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
        const top = Math.max(0, elemRect.top - canvasRect.top);

        const width = Math.min(canvasRect.width, right - left);
        const height = Math.min(canvasRect.height, bottom - top);

        // canvas의 일부분만 렌더링하도록 scissor 적용
        const positiveYUpBottom = canvasRect.height - bottom;
        renderer.setScissor(left, positiveYUpBottom, width, height);
        renderer.setViewport(left, positiveYUpBottom, width, height);

        // 비율 반환
        return width / height;
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
}

main();
