import * as THREE from "../three.module.js";
import { GUI } from "../dat.gui.module.js";
import { OrbitControls } from "../OrbitControls.js";
import { RectAreaLightUniformsLib } from "../RectAreaLightUniformsLib.js";
import { RectAreaLightHelper } from "../RectAreaLightHelper.js";

class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }
    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}

class DegRadHelper {
    constructor(obj, prop) {
        this.obj = obj;
        this.prop = prop;
    }
    get value() {
        return THREE.MathUtils.radToDeg(this.obj[this.prop]);
    }
    set value(v) {
        this.obj[this.prop] = THREE.MathUtils.degToRad(v);
    }
}

function main() {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ canvas });
    RectAreaLightUniformsLib.init();
    const gui = new GUI();

    const scene = new THREE.Scene();

    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

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
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -0.5;
    scene.add(mesh);

    {
        const cubeSize = 4;
        const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        // const cubeMat = new THREE.MeshPhongMaterial({ color: "#8AC" });
        const cubeMat = new THREE.MeshStandardMaterial({ color: "#8AC" });
        const mesh = new THREE.Mesh(cubeGeo, cubeMat);
        mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
        scene.add(mesh);
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
        // const sphereMat = new THREE.MeshPhongMaterial({ color: "#ca8" });
        const sphereMat = new THREE.MeshStandardMaterial({ color: "#ca8" });
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
        scene.add(mesh);
    }

    /*
    // const color = 0xffffff;
    const skyColor = 0xb1e1ff; // 하늘색
    const groundColor = 0xb97a20; // 오렌지 브라운
    const intensity = 1;
    // const light = new THREE.AmbientLight(color, intensity);
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
    */
    const color = 0xffffff;
    const intensity = 5;
    const width = 12;
    const height = 4;
    // const light = new THREE.DirectionalLight(color, intensity);
    // const light = new THREE.PointLight(color, intensity);
    // const light = new THREE.SpotLight(color, intensity);
    const light = new THREE.RectAreaLight(color, intensity, width, height);
    light.position.set(0, 10, 0);
    light.rotation.x = THREE.MathUtils.degToRad(-90);
    // light.target.position.set(-5, 0, 0);
    scene.add(light);
    // scene.add(light.target);

    const helper = new RectAreaLightHelper(light);
    light.add(helper);

    /*
    // gui.addColor(new ColorGUIHelper(light, "color"), "value").name("color");
    gui.addColor(new ColorGUIHelper(light, "color"), "value").name("skyColor");
    gui.addColor(new ColorGUIHelper(light, "groundColor"), "value").name(
        "groundColor"
    );
    --
    gui.add(light, "intensity", 0, 2, 0.01);
    gui.addColor(new ColorGUIHelper(light, "color"), "value").name("color");
    gui.add(light, "intensity", 0, 2, 0.01);
    gui.add(light.target.position, "x", -10, 10);
    gui.add(light.target.position, "z", -10, 10);
    gui.add(light.target.position, "y", 0, 10);
    */

    // const helper = new THREE.DirectionalLightHelper(light);
    // const helper = new THREE.PointLightHelper(light);
    // const helper = new THREE.SpotLightHelper(light);
    // scene.add(helper);

    /*
    function updateLight() {
        // light.target.updateMatrixWorld();
        helper.update();
    }
    updateLight();
    */

    gui.addColor(new ColorGUIHelper(light, "color"), "value").name("color");
    gui.add(light, "intensity", 0, 2, 0.01);
    // gui.add(light, "distance", 0, 40).onChange(updateLight);
    gui.add(light, "width", 0, 20);
    gui.add(light, "height", 0, 20);
    // gui.add(new DegRadHelper(light, "angle"), "value", 0, 90).name("angle").onChange(updateLight);
    // gui.add(light, "penumbra", 0, 1, 0.01);
    gui.add(new DegRadHelper(light.rotation, "x"), "value", -180, 180).name(
        "x rotation"
    );
    gui.add(new DegRadHelper(light.rotation, "y"), "value", -180, 180).name(
        "y rotation"
    );
    gui.add(new DegRadHelper(light.rotation, "z"), "value", -180, 180).name(
        "z rotation"
    );

    makeXYZGUI(gui, light.position, "position");
    // makeXYZGUI(gui, light.target.position, "target", updateLight);

    const objects = [];

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

function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, "x", -10, 10).onChange(onChangeFn);
    folder.add(vector3, "y", 0, 10).onChange(onChangeFn);
    folder.add(vector3, "z", -10, 10).onChange(onChangeFn);
    folder.open();
}

main();
