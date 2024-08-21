// Basic setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000); // Set background color to white
document.getElementById('container').appendChild(renderer.domElement);

// Parameters for the elastic lines
const springConstant = -0.1; // Spring stiffness
const damping = 0.1; // Damping to simulate friction
const restLength = 300; // Rest length of the springs
const cubeSize = 10; // Size of each cube
const numCubes = 20;
const lineOpacity = 0.3; // Opacity of the lines (0 = fully transparent, 1 = fully opaque)

// Create random cubes with unique colors
function createRandomCubes(numCubes) {
    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubes = new THREE.Group();

    for (let i = 0; i < numCubes; i++) {
        const color = new THREE.Color(Math.random() * 0xffffff);
        const material = new THREE.MeshBasicMaterial({ color });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(
            Math.random() * 200 - 100,
            Math.random() * 200 - 100,
            Math.random() * 200 - 100
        );
        cube.originalColor = color.getHex(); // Store original color
        cubes.add(cube);
    }

    return cubes;
}

// Create lines connecting all pairs of cubes
function createAllConnections(cubes) {
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0f00f, opacity: lineOpacity, transparent: true }); // Set line color to black and add opacity
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const lines = [];

    const cubeArray = cubes.children;
    for (let i = 0; i < cubeArray.length; i++) {
        for (let j = i + 1; j < cubeArray.length; j++) {
            const cube1 = cubeArray[i];
            const cube2 = cubeArray[j];
            positions.push(cube1.position.x, cube1.position.y, cube1.position.z);
            positions.push(cube2.position.x, cube2.position.y, cube2.position.z);

            lines.push({ cube1, cube2, restLength });
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return { lines, geometry, material: lineMaterial };
}

// Update elastic lines
function updateElasticLines(lines) {
    const positions = geometry.attributes.position.array;
    lines.forEach(({ cube1, cube2, restLength }, index) => {
        const pos1 = cube1.position;
        const pos2 = cube2.position;

        // Update the positions in the buffer geometry
        positions[index * 6] = pos1.x;
        positions[index * 6 + 1] = pos1.y;
        positions[index * 6 + 2] = pos1.z;
        positions[index * 6 + 3] = pos2.x;
        positions[index * 6 + 4] = pos2.y;
        positions[index * 6 + 5] = pos2.z;

        // Update elastic force
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const dz = pos2.z - pos1.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const force = springConstant * (distance - restLength);
        const dampingForce = damping * ((cube2.velocity || new THREE.Vector3()).length() - (cube1.velocity || new THREE.Vector3()).length());

        const fx = (force + dampingForce) * (dx / distance);
        const fy = (force + dampingForce) * (dy / distance);
        const fz = (force + dampingForce) * (dz / distance);

        cube1.position.addScaledVector(new THREE.Vector3(fx, fy, fz), -0.1);
        cube2.position.addScaledVector(new THREE.Vector3(fx, fy, fz), 0.1);
    });

    // Notify Three.js of changes to the geometry
    geometry.attributes.position.needsUpdate = true;
}

// Add random cubes to the scene
const randomCubes = createRandomCubes(numCubes);
scene.add(randomCubes);

// Add lines connecting all pairs of cubes to the scene
const { lines, geometry, material } = createAllConnections(randomCubes);
const elasticLines = new THREE.LineSegments(geometry, material);
scene.add(elasticLines);

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040);
const pointLight = new THREE.PointLight(0xffffff, 1, 100); // Point light
pointLight.position.set(10, 10, 10);
scene.add(ambientLight);
scene.add(pointLight);

// Position camera
camera.position.z = 500;

// Movement and rotation variables
const moveSpeed = 10;
const rotationSpeed = 0.05;
let rotationX = 0;
let rotationY = 0;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

// Raycaster and mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedCube = null;
let hoveredCube = null;

// Handle mouse click to select a cube
window.addEventListener('click', (event) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.updateMatrixWorld();
    raycaster.setFromCamera(mouse, camera);

    // Find intersections
    const intersects = raycaster.intersectObjects(randomCubes.children);
    if (intersects.length > 0) {
        selectedCube = intersects[0].object;
        // Reset colors of all cubes
        randomCubes.children.forEach(cube => cube.material.color.set(cube.originalColor));
        selectedCube.material.color.set(0xff0000); // Set selected cube color to red
    } else {
        selectedCube = null;
    }
});




// Handle keyboard controls
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            rotationX -= rotationSpeed;
            break;
        case 'ArrowDown':
            rotationX += rotationSpeed;
            break;
        case 'ArrowLeft':
            rotationY -= rotationSpeed;
            break;
        case 'ArrowRight':
            rotationY += rotationSpeed;
            break;
        case 'w':
            moveForward = true;
            break;
        case 's':
            moveBackward = true;
            break;
        case 'a':
            moveLeft = true;
            break;
        case 'd':
            moveRight = true;
            break;
        case 'q':
            moveUp = true;
            break;
        case 'e':
            moveDown = true;
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
            moveForward = false;
            break;
        case 's':
            moveBackward = false;
            break;
        case 'a':
            moveLeft = false;
            break;
        case 'd':
            moveRight = false;
            break;
        case 'q':
            moveUp = false;
            break;
        case 'e':
            moveDown = false;
            break;
    }
});

// Render loop
function animate() {
    requestAnimationFrame(animate);

    // Update elastic lines
    updateElasticLines(lines);

    // Update rotation
    randomCubes.rotation.x = rotationX;
    randomCubes.rotation.y = rotationY;
    elasticLines.rotation.x = rotationX;
    elasticLines.rotation.y = rotationY;

    // Update movement
    if (moveForward) camera.position.z -= moveSpeed;
    if (moveBackward) camera.position.z += moveSpeed;
    if (moveLeft) camera.position.x -= moveSpeed;
    if (moveRight) camera.position.x += moveSpeed;
    if (moveUp) camera.position.y += moveSpeed;
    if (moveDown) camera.position.y -= moveSpeed;

    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
