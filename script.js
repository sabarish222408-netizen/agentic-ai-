import * as THREE from "three";

// ================================
// THREE.JS AI CORE
// ================================

const scene = new THREE.Scene();

const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
        window.innerHeight,
        0.1,
        1000
    );

camera.position.z = 5;

const renderer =
    new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document
    .getElementById("three-container")
    .appendChild(renderer.domElement);


// AI CORE

const geometry =
    new THREE.IcosahedronGeometry(1.3, 2);

const material =
    new THREE.MeshBasicMaterial({
        wireframe: true
    });

const aiCore =
    new THREE.Mesh(
        geometry,
        material
    );

scene.add(aiCore);


// PARTICLES

const particleGeometry =
    new THREE.BufferGeometry();

const particleCount = 700;

const positions =
    new Float32Array(
        particleCount * 3
    );

for (
    let i = 0;
    i < particleCount * 3;
    i++
) {
    positions[i] =
        (Math.random() - 0.5) * 15;
}

particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        positions,
        3
    )
);

const particleMaterial =
    new THREE.PointsMaterial({
        size: 0.025
    });

const particles =
    new THREE.Points(
        particleGeometry,
        particleMaterial
    );

scene.add(particles);


// ANIMATION

function animate() {

    requestAnimationFrame(
        animate
    );

    aiCore.rotation.x += 0.003;
    aiCore.rotation.y += 0.006;

    particles.rotation.y += 0.0005;

    renderer.render(
        scene,
        camera
    );
}

animate();


// ================================
// AGENTIC AI
// ================================

async function runAgent() {

    const question =
        document.getElementById(
            "question"
        ).value;

    const aiAnswer =
        document.getElementById(
            "aiAnswer"
        ).value;

    const result =
        document.getElementById(
            "result"
        );

    if (!question || !aiAnswer) {

        result.innerHTML =
            "⚠️ Enter both question and AI answer.";

        return;
    }


    // STEP 1

    result.innerHTML = `
        🤖 <strong>Agent Started</strong>
        <br><br>
        ⟳ Analyzing AI response...
    `;


    await delay(1000);


    // STEP 2

    result.innerHTML = `
        🤖 <strong>Claim Extraction Agent</strong>
        <br><br>
        ✓ Breaking answer into individual claims...
    `;

    await delay(1000);


    // STEP 3

    result.innerHTML = `
        🔎 <strong>Research Agent</strong>
        <br><br>
        ✓ Searching for supporting evidence...
    `;

    await delay(1000);


    // STEP 4

    result.innerHTML = `
        🧠 <strong>Verification Agent</strong>
        <br><br>
        ✓ Comparing claims with evidence...
    `;

    await delay(1000);


    // STEP 5

    result.innerHTML = `
        📝 <strong>Correction Agent</strong>
        <br><br>
        ✓ Preparing verification report...
    `;

    await delay(1000);


    // DEMO RESULT

    result.innerHTML = `
        <h2>🔍 Verification Complete</h2>

        <hr>

        <h3>Question</h3>

        <p>${question}</p>

        <h3>AI Answer</h3>

        <p>${aiAnswer}</p>

        <h3>Agent Analysis</h3>

        <p>
            The answer has been divided into
            individual claims and sent through
            the verification workflow.
        </p>

        <div class="status">
            ⚠️ Demo Verification
        </div>

        <p>
            Connect a real AI/search API to
            perform live evidence verification.
        </p>
    `;
}


// Helper

function delay(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


// Button

window.runAgent =
    runAgent;


// Resize

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);