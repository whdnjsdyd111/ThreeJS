import * as THREE from "../three.module.js";

function main() {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ canvas });

    //const fov = 75;
    const fov = 40;
    const aspect = 2; // the canvas default
    const near = 0.1;
    //const far = 5;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    //camera.position.z = 2;
    camera.position.z = 120;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaaaaaa);

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    /*
    // const material = new THREE.MeshBasicMaterial({color: 0x44aa88});  // greenish blue
    const material = new THREE.MeshPhongMaterial({color: 0x44aa88});  // greenish blue
    const cube = new THREE.Mesh(geometry, material);
    */
    function makeInstance(geometry, color, x) {
        const meterial = new THREE.MeshPhongMaterial({ color });

        const cube = new THREE.Mesh(geometry, meterial);
        scene.add(cube);

        cube.position.x = x;

        return cube;
    }

    const cubes = [
        makeInstance(geometry, 0x44aa88, 0),
        makeInstance(geometry, 0x8844aa, -2),
        makeInstance(geometry, 0xaa8844, 2),
    ];

    const objects = [];
    const spread = 15;

    function addObject(x, y, obj) {
        obj.position.x = x * spread;
        obj.position.y = y * spread;

        scene.add(obj);
        objects.push(obj);
    }

    function addSolidGeometry(x, y, geometry) {
        const mesh = new THREE.Mesh(geometry, createMaterial());
        addObject(x, y, mesh);
    }

    // scene.add(cube);
    // renderer.render(scene, camera);

    function render(time) {
        time *= 0.001; // convert time to seconds

        /*
        cube.rotation.x = time;
        cube.rotation.y = time;
        */

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * 0.1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    {
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }
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

function createMaterial() {
    const material = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
    });

    const hue = Math.random();
    const saturation = 1;
    const luminance = 0.5;
    material.color.setHSL(hue, saturation, luminance);

    return material;
}

main();
