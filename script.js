// script.js

// Basic setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Linear interpolation function
function lerp(p0, p1, t) {
    return p0 + t * (p1 - p0);
}

// Linear interpolation function for colors
function lerpColor(color1, color2, t) {
    return new THREE.Color(
        lerp(color1.r, color2.r, t),
        lerp(color1.g, color2.g, t),
        lerp(color1.b, color2.b, t)
    );
}

// Random color generator
function randomColor() {
    return new THREE.Color(Math.random(), Math.random(), Math.random());
}

// Create a Mandelbulb fractal with color blending
function createMandelbulb() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const resolution = 64; // Lower resolution for fewer vertices
    const scale = 2;
    const maxIterations = 5; // Lower number of iterations for simplification
    const distanceThreshold = 10; // Distance within which vertices are rendered

    const vertexColors = {};

    for (let x = -resolution; x < resolution; x++) {
        for (let y = -resolution; y < resolution; y++) {
            for (let z = -resolution; z < resolution; z++) {
                const x0 = scale * (x / resolution - 0.5);
                const y0 = scale * (y / resolution - 0.5);
                const z0 = scale * (z / resolution - 0.5);
                let r = Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0);

                if (r > distanceThreshold) continue; // Skip vertices that are too far

                let theta = Math.atan2(Math.sqrt(x0 * x0 + y0 * y0), z0);
                let phi = Math.atan2(y0, x0);
                let x1 = Math.pow(r, 4) * Math.sin(theta * 4) * Math.cos(phi * 4);
                let y1 = Math.pow(r, 4) * Math.sin(theta * 4) * Math.sin(phi * 4);
                let z1 = Math.pow(r, 4) * Math.cos(theta * 4);

                let i = 0;
                while (r < 1 && i < maxIterations) {
                    r = Math.sqrt(x1 * x1 + y1 * y1 + z1 * z1);
                    theta = Math.atan2(Math.sqrt(x1 * x1 + y1 * y1), z1);
                    phi = Math.atan2(y1, x1);
                    x1 = Math.pow(r, 4) * Math.sin(theta * 4) * Math.cos(phi * 4);
                    y1 = Math.pow(r, 4) * Math.sin(theta * 4) * Math.sin(phi * 4);
                    z1 = Math.pow(r, 4) * Math.cos(theta * 4);
                    i++;
                }

                // Random vertex color
                const color = randomColor();
                vertexColors[`${x1},${y1},${z1}`] = color;

                colors.push(color.r, color.g, color.b);
                vertices.push(x1, y1, z1);

                // Interpolation between this and the next vertex
                if (x < resolution - 1) {
                    const x2 = scale * ((x + 1) / resolution - 0.5);
                    const y2 = scale * (y / resolution - 0.5);
                    const z2 = scale * (z / resolution - 0.5);
                    let r2 = Math.sqrt(x2 * x2 + y2 * y2 + z2 * z2);

                    if (r2 <= distanceThreshold) {
                        let theta2 = Math.atan2(Math.sqrt(x2 * x2 + y2 * y2), z2);
                        let phi2 = Math.atan2(y2, x2);
                        let x3 = Math.pow(r2, 4) * Math.sin(theta2 * 4) * Math.cos(phi2 * 4);
                        let y3 = Math.pow(r2, 4) * Math.sin(theta2 * 4) * Math.sin(phi2 * 4);
                        let z3 = Math.pow(r2, 4) * Math.cos(theta2 * 4);

                        // Get colors for current and next vertex
                        const color1 = vertexColors[`${x1},${y1},${z1}`] || randomColor();
                        const color2 = vertexColors[`${x3},${y3},${z3}`] || randomColor();
                        const blendedColor = lerpColor(color1, color2, 0.5);

                        colors.push(blendedColor.r, blendedColor.g, blendedColor.b);
                        vertices.push(lerp(x1, x3, 0.5), lerp(y1, y3, 0.5), lerp(z1, z3, 0.5));
                    }
                }

                if (y < resolution - 1) {
                    const x2 = scale * (x / resolution - 0.5);
                    const y2 = scale * ((y + 1) / resolution - 0.5);
                    const z2 = scale * (z / resolution - 0.5);
                    let r2 = Math.sqrt(x2 * x2 + y2 * y2 + z2 * z2);

                    if (r2 <= distanceThreshold) {
                        let theta2 = Math.atan2(Math.sqrt(x2 * x2 + y2 * y2), z2);
                        let phi2 = Math.atan2(y2, x2);
                        let x3 = Math.pow(r2, 4) * Math.sin(theta2 * 4) * Math.cos(phi2 * 4);
                        let y3 = Math.pow(r2, 4) * Math.sin(theta2 * 4) * Math.sin(phi2 * 4);
                        let z3 = Math.pow(r2, 4) * Math.cos(theta2 * 4);

                        // Get colors for current and next vertex
                        const color1 = vertexColors[`${x1},${y1},${z1}`] || randomColor();
                        const color2 = vertexColors[`${x3},${y3},${z3}`] || randomColor();
                        const blendedColor = lerpColor(color1, color2, 0.5);

                        colors.push(blendedColor.r, blendedColor.g, blendedColor.b);
                        vertices.push(lerp(x1, x3, 0.5), lerp(y1, y3, 0.5), lerp(z1, z3, 0.5));
                    }
                }
            }
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({ size: 0.1, vertexColors: true });
    return new THREE.Points(geometry, material);
}

// Add Mandelbulb fractal to the scene
const mandelbulb = createMandelbulb();
scene.add(mandelbulb);

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040); // Ambient light
const pointLight = new THREE.PointLight(0xffffff, 1, 100); // Point light
pointLight.position.set(10, 10, 10);
scene.add(ambientLight);
scene.add(pointLight);

// Position camera
camera.position.z = 50;

// Movement and rotation variables
const moveSpeed = 1;
const rotationSpeed = 0.05;
let rotationX = 0;
let rotationY = 0;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

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
    
    // Update rotation
    mandelbulb.rotation.x = rotationX;
    mandelbulb.rotation.y = rotationY;
    
    // Update movement
    if (moveForward) camera.position.z -= moveSpeed;
    if (moveBackward) camera.position.z += moveSpeed;
    if (moveLeft) camera.position.x -= moveSpeed;
    if (moveRight) camera.position.x += moveSpeed;
    if (moveUp) camera.position.y += moveSpeed;
    if (moveDown) camera.position.y += moveSpeed;

    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
