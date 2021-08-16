import * as THREE from "../three.module.js";
import { GUI } from "../dat.gui.module.js";
import { OrbitControls } from "../OrbitControls.js";

function main() {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ canvas });
    const gui = new GUI();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("white");

    const loader = new THREE.TextureLoader();

    const sphereShadowBases = [];

    {
        {
            const planeSize = 40;

            const texture = loader.load("./tile.png");
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.magFilter = THREE.NearestFilter;
            const repeats = planeSize / 2;
            texture.repeat.set(repeats, repeats);

            const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
            const planeMat = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
            });
            planeMat.color.setRGB(1.5, 1.5, 1.5);
            const mesh = new THREE.Mesh(planeGeo, planeMat);
            mesh.rotation.x = Math.PI * -0.5;
            scene.add(mesh);
        }
        {
            const skyColor = 0xb1e1ff; // 하늘색
            const groundColor = 0xb97a20; // 오렌지 브라운
            const intensity = 2;
            const light = new THREE.HemisphereLight(
                skyColor,
                groundColor,
                intensity
            );
            scene.add(light);
        }
        {
            const color = 0xffffff;
            const intensity = 1;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(0, 10, 5);
            light.target.position.set(-5, 0, 0);
            scene.add(light);
            scene.add(light.target);
        }
        {
            const shadowTexture = loader.load("./roundshadow.png");

            const sphereRadius = 1;
            const sphereWidthDivisions = 32;
            const sphereHeightDivisions = 16;
            const sphereGeo = new THREE.SphereGeometry(
                sphereRadius,
                sphereWidthDivisions,
                sphereHeightDivisions
            );

            const planeSize = 1;
            const shadowGeo = new THREE.PlaneGeometry(planeSize, planeSize);

            const numSphere = 15;
            for (let i = 0; i < numSphere; ++i) {
                // 구체와 그림자가 같이 움직이는 컨테이너
                const base = new THREE.Object3D();
                scene.add(base);

                /**
                 * 그림자를 컨테이너에 추가
                 * 주의 : 여기서는 각 구체의 투명도를 따로 설정할 수 있게
                 * 재질을 각각 따로 만듦
                 */
                const shadowMat = new THREE.MeshBasicMaterial({
                    map: shadowTexture,
                    transparent: true,
                    depthWrite: false,
                });
                const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
                shadowMesh.position.y = 0.001;
                shadowMesh.rotation.x = Math.PI * -0.5;
                const shadowSize = sphereRadius * 4;
                shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
                base.add(shadowMesh);

                // 구체를 컨테이너에 추가
                const u = i / numSphere;
                const sphereMat = new THREE.MeshPhongMaterial();
                sphereMat.color.setHSL(u, 1, 0.75);
                const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
                sphereMesh.position.set(0, sphereRadius + 2, 0);
                base.add(sphereMesh);

                // y 축 좌표를 포함한 나머지 요소 기록
                sphereShadowBases.push({
                    base,
                    sphereMesh,
                    shadowMesh,
                    y: sphereMesh.position.y,
                });
            }
        }
    }

    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    function render(time) {
        time *= 0.001;

        sphereShadowBases.forEach((sphereShadowBase, ndx) => {
            const { base, sphereMesh, shadowMesh, y } = sphereShadowBase;

            // u 는 구체의 반복문을 실행하면서 인덱스에 따라 0 이상 , 1 이하로 지정
            const u = ndx / sphereShadowBases.length;

            /**
             * 컨테이너의 위치를 계산
             * 구체와 그림자가 종속적으로 위치 변경
             */
            const speed = time * 0.2;
            const angle = speed + u * Math.PI * 2 * (ndx % 1 ? 1 : -1);
            const radius = Math.sin(speed - ndx) * 10;
            base.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );

            // yOff 값은 0 이상 1 이하
            const yOff = Math.abs(Math.sin(time * 2 + ndx));
            // 구체를 위아래로 튕김
            sphereMesh.position.y = y + THREE.MathUtils.lerp(-2, 2, yOff);
            // 구체가 위로 올라갈수록 그림자가 옅어짐
            shadowMesh.material.opacity = THREE.MathUtils.lerp(1, 0.25, yOff);
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
