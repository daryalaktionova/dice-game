
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";

// =====================================================
// ЭЛЕМЕНТЫ СТРАНИЦЫ
// =====================================================

const diceSpace = document.getElementById("dice-space");
const rollButton = document.getElementById("roll");
const resultMessage = document.getElementById("result");
const soundButton = document.getElementById("sound-toggle");
const soundIcon = document.getElementById("sound-icon");
const skinButtons = document.querySelectorAll(".skin-option");

if (!diceSpace || !rollButton || !resultMessage) {
    throw new Error("Не найдены основные элементы игры в HTML.");
}

// =====================================================
// СКИНЫ
// =====================================================

const skins = [
    {
        name: "Звёздный артефакт",
        body: 0x111c30,
        edges: 0x8bb8d4,
        numbers: "#edf6ff",
        glow: 0x78bce8,
        light: 0xbfd9f0,
        ambient: 0xb9cde0,
        texture: "cosmic",
        ornament: "cosmic",
        metalness: 0.38,
        roughness: 0.53,
        emissiveIntensity: 0.30,
        glowIntensity: 5
    },
    {
        name: "Золото алхимиков",
        body: 0x98702a,
        edges: 0xf3ce79,
        numbers: "#fff0bd",
        glow: 0xd69a35,
        light: 0xffd88c,
        ambient: 0xd9c49b,
        texture: "gold",
        ornament: "gold",
        metalness: 0.78,
        roughness: 0.30,
        emissiveIntensity: 0.10,
        glowIntensity: 2.8
    },
    {
        name: "Адский обсидиан",
        body: 0x100609,
        edges: 0x72202b,
        numbers: "#ff1717",
        glow: 0xff1010,
        light: 0xffb0b8,
        ambient: 0x827078,
        texture: "infernal",
        ornament: "infernal",
        metalness: 0.78,
        roughness: 0.17,
        emissiveIntensity: 0.16,
        glowIntensity: 2.2
    }
];

// =====================================================
// ПОВТОРЯЕМЫЙ ГЕНЕРАТОР СЛУЧАЙНЫХ ЧИСЕЛ
// =====================================================

function seededRandom(seed) {
    let state = seed >>> 0;

    return function () {
        state = (1664525 * state + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

// =====================================================
// ПРОЦЕДУРНЫЕ ТЕКСТУРЫ
// =====================================================

function createTextureSet(kind) {
    const width = 1536;
    const height = 768;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = width;
    glowCanvas.height = height;

    const ctx = canvas.getContext("2d");
    const glowCtx = glowCanvas.getContext("2d");

    if (!ctx || !glowCtx) {
        throw new Error("Не удалось создать текстуры кубика.");
    }

    const seeds = {
        cosmic: 726410,
        gold: 492713,
        infernal: 836129
    };

    const random = seededRandom(seeds[kind]);

    // -------------------------------------------------
    // 1. ЗВЁЗДНЫЙ САПФИРОВЫЙ КУБИК
    // -------------------------------------------------

    if (kind === "cosmic") {
        const base = ctx.createLinearGradient(0, 0, width, height);

        base.addColorStop(0, "#080f1e");
        base.addColorStop(0.18, "#111d32");
        base.addColorStop(0.36, "#18334d");
        base.addColorStop(0.51, "#10263e");
        base.addColorStop(0.70, "#202b47");
        base.addColorStop(0.86, "#121d33");
        base.addColorStop(1, "#091322");

        ctx.fillStyle = base;
        ctx.fillRect(0, 0, width, height);

        const clouds = [
            { x: 160, y: 170, r: 245, c: "95,156,204", a: 0.39 },
            { x: 360, y: 495, r: 310, c: "66,121,176", a: 0.34 },
            { x: 590, y: 220, r: 285, c: "123,181,222", a: 0.38 },
            { x: 790, y: 480, r: 335, c: "60,111,166", a: 0.39 },
            { x: 1030, y: 170, r: 290, c: "91,141,193", a: 0.35 },
            { x: 1290, y: 400, r: 300, c: "119,163,205", a: 0.34 },
            { x: 1430, y: 120, r: 225, c: "68,111,168", a: 0.31 },
            { x: 250, y: 650, r: 220, c: "108,151,188", a: 0.27 },
            { x: 1000, y: 650, r: 275, c: "75,105,167", a: 0.31 },
            { x: 680, y: 360, r: 195, c: "106,130,203", a: 0.25 }
        ];

        for (const cloud of clouds) {
            const gradient = ctx.createRadialGradient(
                cloud.x, cloud.y, 0,
                cloud.x, cloud.y, cloud.r
            );

            gradient.addColorStop(0, `rgba(${cloud.c},${cloud.a})`);
            gradient.addColorStop(0.3, `rgba(${cloud.c},${cloud.a * 0.72})`);
            gradient.addColorStop(0.65, `rgba(${cloud.c},${cloud.a * 0.27})`);
            gradient.addColorStop(1, `rgba(${cloud.c},0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(
                cloud.x - cloud.r,
                cloud.y - cloud.r,
                cloud.r * 2,
                cloud.r * 2
            );
        }

        const filamentColors = [
            "129,190,229",
            "91,151,205",
            "142,169,222",
            "173,205,227"
        ];

        for (let i = 0; i < 46; i++) {
            const x = random() * width;
            const y = random() * height;
            const endX = x + (random() - 0.5) * 620;
            const endY = y + (random() - 0.5) * 340;

            const color = filamentColors[
                Math.floor(random() * filamentColors.length)
            ];

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.bezierCurveTo(
                x + (random() - 0.5) * 420,
                y + (random() - 0.5) * 270,
                endX + (random() - 0.5) * 420,
                endY + (random() - 0.5) * 270,
                endX,
                endY
            );

            ctx.strokeStyle = `rgba(${color},${0.045 + random() * 0.085})`;
            ctx.lineWidth = 2 + random() * 11;
            ctx.lineCap = "round";
            ctx.shadowColor = `rgba(${color},0.2)`;
            ctx.shadowBlur = 15;
            ctx.stroke();
        }

        ctx.shadowBlur = 0;

        const grainColors = [
            "173,208,231",
            "120,158,191",
            "76,112,153",
            "192,210,224"
        ];

        for (let i = 0; i < 25000; i++) {
            const color = grainColors[
                Math.floor(random() * grainColors.length)
            ];

            ctx.beginPath();
            ctx.arc(
                random() * width,
                random() * height,
                0.3 + random() * 1.1,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = `rgba(${color},${0.025 + random() * 0.1})`;
            ctx.fill();
        }

        const starColors = [
            "236,246,255",
            "191,222,247",
            "218,231,255",
            "151,200,238"
        ];

        function drawCosmicStar(x, y, radius, alpha, luminous) {
            const color = starColors[
                Math.floor(random() * starColors.length)
            ];

            if (luminous) {
                const gradient = ctx.createRadialGradient(
                    x, y, 0, x, y, radius * 6
                );

                gradient.addColorStop(0, `rgba(${color},${alpha * 0.72})`);
                gradient.addColorStop(0.2, `rgba(${color},${alpha * 0.32})`);
                gradient.addColorStop(1, `rgba(${color},0)`);

                ctx.fillStyle = gradient;
                ctx.fillRect(
                    x - radius * 6,
                    y - radius * 6,
                    radius * 12,
                    radius * 12
                );

                const emissive = glowCtx.createRadialGradient(
                    x, y, 0, x, y, radius * 5
                );

                emissive.addColorStop(
                    0, `rgba(218,239,255,${alpha * 0.88})`
                );
                emissive.addColorStop(
                    0.3, `rgba(111,180,231,${alpha * 0.38})`
                );
                emissive.addColorStop(1, "rgba(0,0,0,0)");

                glowCtx.fillStyle = emissive;
                glowCtx.fillRect(
                    x - radius * 5,
                    y - radius * 5,
                    radius * 10,
                    radius * 10
                );
            }

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color},${alpha})`;
            ctx.fill();

            if (luminous) {
                ctx.strokeStyle = `rgba(229,243,255,${alpha * 0.68})`;
                ctx.lineWidth = 0.8;

                ctx.beginPath();
                ctx.moveTo(x - radius * 2.5, y);
                ctx.lineTo(x + radius * 2.5, y);
                ctx.moveTo(x, y - radius * 2.5);
                ctx.lineTo(x, y + radius * 2.5);
                ctx.stroke();
            }
        }

        for (let i = 0; i < 2900; i++) {
            drawCosmicStar(
                random() * width,
                random() * height,
                0.4 + random() * 0.9,
                0.34 + random() * 0.58,
                false
            );
        }

        for (let i = 0; i < 320; i++) {
            drawCosmicStar(
                random() * width,
                random() * height,
                1.1 + random() * 1.5,
                0.63 + random() * 0.37,
                random() > 0.65
            );
        }

        for (let i = 0; i < 48; i++) {
            drawCosmicStar(
                random() * width,
                random() * height,
                2 + random() * 2.5,
                0.78 + random() * 0.22,
                true
            );
        }
    }

    // -------------------------------------------------
    // 2. ЗОЛОТО АЛХИМИКОВ
    // -------------------------------------------------

    if (kind === "gold") {
        const base = ctx.createLinearGradient(0, 0, width, height);

        base.addColorStop(0, "#34200e");
        base.addColorStop(0.14, "#765020");
        base.addColorStop(0.28, "#b88837");
        base.addColorStop(0.43, "#5c401b");
        base.addColorStop(0.58, "#d0a64e");
        base.addColorStop(0.72, "#8e642a");
        base.addColorStop(0.86, "#4b3218");
        base.addColorStop(1, "#c39a48");

        ctx.fillStyle = base;
        ctx.fillRect(0, 0, width, height);

        const patches = [
            { x: 160, y: 150, r: 250, c: "31,22,14", a: 0.58 },
            { x: 450, y: 550, r: 320, c: "248,205,105", a: 0.30 },
            { x: 720, y: 180, r: 300, c: "37,27,17", a: 0.42 },
            { x: 980, y: 510, r: 330, c: "255,218,130", a: 0.27 },
            { x: 1300, y: 180, r: 290, c: "55,35,17", a: 0.40 },
            { x: 1420, y: 610, r: 240, c: "245,195,90", a: 0.24 }
        ];

        for (const patch of patches) {
            const gradient = ctx.createRadialGradient(
                patch.x, patch.y, 0,
                patch.x, patch.y, patch.r
            );

            gradient.addColorStop(0, `rgba(${patch.c},${patch.a})`);
            gradient.addColorStop(0.55, `rgba(${patch.c},${patch.a * 0.35})`);
            gradient.addColorStop(1, `rgba(${patch.c},0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(
                patch.x - patch.r,
                patch.y - patch.r,
                patch.r * 2,
                patch.r * 2
            );
        }

        for (let i = 0; i < 65; i++) {
            const x = random() * width;
            const y = random() * height;
            const length = 40 + random() * 190;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.bezierCurveTo(
                x + length * 0.25,
                y + (random() - 0.5) * 65,
                x + length * 0.6,
                y + (random() - 0.5) * 65,
                x + length,
                y + (random() - 0.5) * 35
            );

            ctx.strokeStyle = random() > 0.45
                ? "rgba(255,225,151,0.20)"
                : "rgba(36,22,10,0.32)";

            ctx.lineWidth = 0.8 + random() * 2.3;
            ctx.stroke();
        }

        for (let i = 0; i < 22000; i++) {
            const x = random() * width;
            const y = random() * height;
            const length = 0.3 + random() * 2;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + length, y + (random() - 0.5) * length);

            ctx.strokeStyle = random() > 0.46
                ? `rgba(255,233,178,${0.06 + random() * 0.23})`
                : `rgba(30,19,10,${0.05 + random() * 0.22})`;

            ctx.lineWidth = 0.4 + random() * 0.8;
            ctx.stroke();
        }

        for (let i = 0; i < 85; i++) {
            const x = random() * width;
            const y = random() * height;
            const radius = 2 + random() * 7;

            const gradient = glowCtx.createRadialGradient(
                x, y, 0, x, y, radius * 3
            );

            gradient.addColorStop(0, "rgba(255,190,65,0.35)");
            gradient.addColorStop(1, "rgba(0,0,0,0)");

            glowCtx.fillStyle = gradient;
            glowCtx.fillRect(
                x - radius * 3,
                y - radius * 3,
                radius * 6,
                radius * 6
            );
        }
    }

    // -------------------------------------------------
    // 3. АДСКИЙ ОБСИДИАН
    // Глянцевый чёрно-бордовый камень с красными прожилками
    // -------------------------------------------------

    if (kind === "infernal") {
        const base = ctx.createLinearGradient(0, 0, width, height);

        base.addColorStop(0, "#050305");
        base.addColorStop(0.12, "#18070d");
        base.addColorStop(0.24, "#080609");
        base.addColorStop(0.37, "#290a13");
        base.addColorStop(0.49, "#080608");
        base.addColorStop(0.62, "#1d080e");
        base.addColorStop(0.76, "#10080c");
        base.addColorStop(0.9, "#230910");
        base.addColorStop(1, "#040304");

        ctx.fillStyle = base;
        ctx.fillRect(0, 0, width, height);

        // Дымчатые бордовые переливы.
        const clouds = [
            { x: 180, y: 160, r: 250, c: "103,20,36", a: 0.48 },
            { x: 410, y: 520, r: 310, c: "65,12,26", a: 0.44 },
            { x: 670, y: 230, r: 270, c: "130,23,42", a: 0.28 },
            { x: 850, y: 570, r: 330, c: "75,13,29", a: 0.42 },
            { x: 1110, y: 180, r: 290, c: "120,17,35", a: 0.35 },
            { x: 1370, y: 470, r: 300, c: "62,10,24", a: 0.46 },
            { x: 580, y: 390, r: 210, c: "92,19,37", a: 0.22 }
        ];

        for (const cloud of clouds) {
            const gradient = ctx.createRadialGradient(
                cloud.x, cloud.y, 0,
                cloud.x, cloud.y, cloud.r
            );

            gradient.addColorStop(0, `rgba(${cloud.c},${cloud.a})`);
            gradient.addColorStop(0.4, `rgba(${cloud.c},${cloud.a * 0.55})`);
            gradient.addColorStop(1, `rgba(${cloud.c},0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(
                cloud.x - cloud.r,
                cloud.y - cloud.r,
                cloud.r * 2,
                cloud.r * 2
            );
        }

        // Тонкие извилистые прожилки в толще обсидиана.
        for (let i = 0; i < 95; i++) {
            const x = random() * width;
            const y = random() * height;
            const length = 35 + random() * 210;

            ctx.beginPath();
            ctx.moveTo(x, y);

            ctx.bezierCurveTo(
                x + length * 0.25,
                y + (random() - 0.5) * 70,
                x + length * 0.65,
                y + (random() - 0.5) * 55,
                x + length,
                y + (random() - 0.5) * 28
            );

            ctx.strokeStyle = random() > 0.55
                ? `rgba(173,35,56,${0.035 + random() * 0.09})`
                : `rgba(205,170,181,${0.018 + random() * 0.045})`;

            ctx.lineWidth = 0.5 + random() * 2.2;
            ctx.lineCap = "round";
            ctx.stroke();
        }

        // Мелкая минеральная фактура.
        for (let i = 0; i < 14000; i++) {
            const x = random() * width;
            const y = random() * height;
            const radius = 0.3 + random() * 0.9;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);

            ctx.fillStyle = random() > 0.5
                ? `rgba(220,170,185,${0.018 + random() * 0.045})`
                : `rgba(120,18,36,${0.025 + random() * 0.06})`;

            ctx.fill();
        }

        // Узкий холодный блик полированного камня.
        const sheen = ctx.createLinearGradient(
            0, 0, width * 0.75, height
        );

        sheen.addColorStop(0, "rgba(255,255,255,0)");
        sheen.addColorStop(0.36, "rgba(255,255,255,0)");
        sheen.addColorStop(0.46, "rgba(210,185,195,0.055)");
        sheen.addColorStop(0.49, "rgba(255,235,240,0.12)");
        sheen.addColorStop(0.52, "rgba(255,255,255,0.035)");
        sheen.addColorStop(0.59, "rgba(255,255,255,0)");
        sheen.addColorStop(1, "rgba(255,255,255,0)");

        ctx.fillStyle = sheen;
        ctx.fillRect(0, 0, width, height);

        // Едва заметное красное отражение.
        const reflection = ctx.createRadialGradient(
            width * 0.55, height * 0.45, 10,
            width * 0.55, height * 0.45, width * 0.48
        );

        reflection.addColorStop(0, "rgba(120,8,25,0.09)");
        reflection.addColorStop(0.55, "rgba(70,5,16,0.035)");
        reflection.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = reflection;
        ctx.fillRect(0, 0, width, height);

        // Glow-текстура остаётся пустой:
        // свечение создают красные цифры и освещение сцены.
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;

    const emissiveTexture = new THREE.CanvasTexture(glowCanvas);
    emissiveTexture.colorSpace = THREE.SRGBColorSpace;
    emissiveTexture.anisotropy = 4;

    return { texture, emissiveTexture };
}

const textureSets = {
    cosmic: createTextureSet("cosmic"),
    gold: createTextureSet("gold"),
    infernal: createTextureSet("infernal")
};

// =====================================================
// СЦЕНА THREE.JS
// =====================================================

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0, 0, 4.5);

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000, 0);

diceSpace.appendChild(renderer.domElement);

// =====================================================
// ОСВЕЩЕНИЕ
// =====================================================

const ambientLight = new THREE.AmbientLight(0xb9cde0, 1.5);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xc8e1f5, 2.7);
mainLight.position.set(-3, 4, 5);
scene.add(mainLight);

const magicLight = new THREE.PointLight(0x79bce9, 5);
magicLight.position.set(2, -2, 3);
scene.add(magicLight);

const rimLight = new THREE.DirectionalLight(0x639acb, 1.5);
rimLight.position.set(3, 1, -4);
scene.add(rimLight);

// =====================================================
// ГЕОМЕТРИЯ D20
// =====================================================

const dice = new THREE.Group();
scene.add(dice);

const geometry = new THREE.IcosahedronGeometry(0.92, 0);

const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: textureSets.cosmic.texture,
    emissive: 0xffffff,
    emissiveMap: textureSets.cosmic.emissiveTexture,
    emissiveIntensity: skins[0].emissiveIntensity,
    metalness: skins[0].metalness,
    roughness: skins[0].roughness,
    flatShading: true
});

const body = new THREE.Mesh(geometry, bodyMaterial);
dice.add(body);

const edgeMaterial = new THREE.LineBasicMaterial({
    color: skins[0].edges,
    transparent: true,
    opacity: 1
});

const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    edgeMaterial
);

dice.add(edges);

// =====================================================
// ТЕКСТУРЫ ЦИФР
// =====================================================

function createNumberTexture(number, color) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;

    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("Не удалось создать текстуру цифры.");
    }

    context.clearRect(0, 0, 256, 256);
    context.font = "bold 200px Georgia";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = color;
    context.shadowColor = color;
    context.shadowBlur = 16;

    context.fillText(String(number), 128, 132, 228);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;

    return texture;
}

// =====================================================
// ГРАНИ И НУМЕРАЦИЯ
// =====================================================

const positions = geometry.getAttribute("position");
const faces = [];

for (let i = 0; i < positions.count / 3; i++) {
    const a = new THREE.Vector3().fromBufferAttribute(positions, i * 3);
    const b = new THREE.Vector3().fromBufferAttribute(positions, i * 3 + 1);
    const c = new THREE.Vector3().fromBufferAttribute(positions, i * 3 + 2);

    const center = new THREE.Vector3()
        .add(a)
        .add(b)
        .add(c)
        .divideScalar(3);

    const normal = new THREE.Vector3()
        .subVectors(b, a)
        .cross(new THREE.Vector3().subVectors(c, a))
        .normalize();

    if (normal.dot(center) < 0) {
        normal.negate();
    }

    faces.push({
        center,
        normal,
        vertices: [a.clone(), b.clone(), c.clone()],
        number: null,
        up: null,
        right: null,
        label: null
    });
}

// Противоположные грани: 1+20, 2+19, ..., 10+11.
const used = new Set();
let pairNumber = 1;

for (let i = 0; i < faces.length; i++) {
    if (used.has(i)) continue;

    let oppositeIndex = -1;
    let lowestDot = Infinity;

    for (let j = 0; j < faces.length; j++) {
        if (i === j || used.has(j)) continue;

        const dot = faces[i].normal.dot(faces[j].normal);

        if (dot < lowestDot) {
            lowestDot = dot;
            oppositeIndex = j;
        }
    }

    if (oppositeIndex === -1) {
        throw new Error("Не удалось найти противоположную грань.");
    }

    faces[i].number = pairNumber;
    faces[oppositeIndex].number = 21 - pairNumber;

    used.add(i);
    used.add(oppositeIndex);
    pairNumber++;
}

// =====================================================
// ОРНАМЕНТЫ ВСЕХ ТРЁХ СКИНОВ
// =====================================================

function addSegment(array, start, end) {
    array.push(
        start.x, start.y, start.z,
        end.x, end.y, end.z
    );
}

function createSegmentsGeometry(points) {
    const segmentGeometry = new THREE.BufferGeometry();

    segmentGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(points, 3)
    );

    return segmentGeometry;
}

function facePoint(face, x, y, offset = 0.008) {
    return face.center.clone()
        .addScaledVector(face.right, x)
        .addScaledVector(face.up, y)
        .addScaledVector(face.normal, offset);
}

function addLocalSegment(face, points, x1, y1, x2, y2) {
    addSegment(
        points,
        facePoint(face, x1, y1),
        facePoint(face, x2, y2)
    );
}

function addCircle(face, points, x, y, radius, segments = 24) {
    for (let i = 0; i < segments; i++) {
        const a1 = (i / segments) * Math.PI * 2;
        const a2 = ((i + 1) / segments) * Math.PI * 2;

        addLocalSegment(
            face,
            points,
            x + Math.cos(a1) * radius,
            y + Math.sin(a1) * radius,
            x + Math.cos(a2) * radius,
            y + Math.sin(a2) * radius
        );
    }
}

function addDiamond(face, points, x, y, radius) {
    const top = [x, y + radius];
    const right = [x + radius * 0.65, y];
    const bottom = [x, y - radius];
    const left = [x - radius * 0.65, y];

    addLocalSegment(face, points, ...top, ...right);
    addLocalSegment(face, points, ...right, ...bottom);
    addLocalSegment(face, points, ...bottom, ...left);
    addLocalSegment(face, points, ...left, ...top);
}

function addTriangleFrame(face, points, scale, dashed = false) {
    const vertices = face.vertices.map((vertex) => {
        const relative = vertex.clone().sub(face.center);

        return {
            x: relative.dot(face.right) * scale,
            y: relative.dot(face.up) * scale
        };
    });

    for (let i = 0; i < vertices.length; i++) {
        const a = vertices[i];
        const b = vertices[(i + 1) % vertices.length];

        if (!dashed) {
            addLocalSegment(face, points, a.x, a.y, b.x, b.y);
        } else {
            for (const [t1, t2] of [
                [0.1, 0.32],
                [0.68, 0.9]
            ]) {
                addLocalSegment(
                    face,
                    points,
                    a.x + (b.x - a.x) * t1,
                    a.y + (b.y - a.y) * t1,
                    a.x + (b.x - a.x) * t2,
                    a.y + (b.y - a.y) * t2
                );
            }
        }
    }
}

function buildOrnamentGroup(style) {
    const group = new THREE.Group();

    const primaryPoints = [];
    const accentPoints = [];

    for (const face of faces) {
        const vertices = face.vertices.map((vertex) => {
            const relative = vertex.clone().sub(face.center);

            return {
                x: relative.dot(face.right),
                y: relative.dot(face.up)
            };
        });

        if (style === "cosmic") {
            addTriangleFrame(face, primaryPoints, 0.84);
            addCircle(face, accentPoints, 0, 0, 0.185, 20);
            addDiamond(face, primaryPoints, 0, 0, 0.11);

            for (let i = 0; i < 8; i++) {
                const angle = i * Math.PI / 4;

                addLocalSegment(
                    face,
                    accentPoints,
                    Math.cos(angle) * 0.19,
                    Math.sin(angle) * 0.19,
                    Math.cos(angle) * 0.218,
                    Math.sin(angle) * 0.218
                );
            }

            for (const vertex of vertices) {
                addDiamond(
                    face,
                    accentPoints,
                    vertex.x * 0.63,
                    vertex.y * 0.63,
                    0.027
                );
            }
        }

        if (style === "gold") {
            addTriangleFrame(face, primaryPoints, 0.86);
            addTriangleFrame(face, accentPoints, 0.72, true);

            addCircle(face, accentPoints, 0, 0, 0.19, 28);
            addCircle(face, primaryPoints, 0, 0, 0.215, 28);

            for (let i = 0; i < 12; i++) {
                const angle = i * Math.PI / 6;

                addLocalSegment(
                    face,
                    accentPoints,
                    Math.cos(angle) * 0.218,
                    Math.sin(angle) * 0.218,
                    Math.cos(angle) * 0.242,
                    Math.sin(angle) * 0.242
                );
            }

            for (const vertex of vertices) {
                const x = vertex.x * 0.59;
                const y = vertex.y * 0.59;

                addCircle(face, primaryPoints, x, y, 0.032, 10);
                addDiamond(face, accentPoints, x, y, 0.021);
            }
        }

        // Третий скин: лаконичные красные медальоны.
        // Двойное кольцо, треугольная рамка и небольшие ромбы.
        if (style === "infernal") {
            addCircle(face, primaryPoints, 0, 0, 0.205, 32);
            addCircle(face, accentPoints, 0, 0, 0.17, 32);

            addTriangleFrame(face, primaryPoints, 0.79);

            for (let i = 0; i < 12; i++) {
                const angle = i * Math.PI / 6;

                addLocalSegment(
                    face,
                    accentPoints,
                    Math.cos(angle) * 0.177,
                    Math.sin(angle) * 0.177,
                    Math.cos(angle) * 0.198,
                    Math.sin(angle) * 0.198
                );
            }

            for (const vertex of vertices) {
                const x = vertex.x * 0.58;
                const y = vertex.y * 0.58;

                addDiamond(face, accentPoints, x, y, 0.025);
            }

            addDiamond(face, primaryPoints, 0, 0, 0.095);
        }
    }

    const palettes = {
        cosmic: {
            primary: 0x557fa6,
            accent: 0xc1e4ff,
            opacity: 0.78
        },
        gold: {
            primary: 0x65431a,
            accent: 0xffdf8f,
            opacity: 0.88
        },
        infernal: {
            primary: 0x65121f,
            accent: 0xff4b55,
            opacity: 0.88
        }
    };

    const palette = palettes[style];

    const primaryMaterial = new THREE.LineBasicMaterial({
        color: palette.primary,
        transparent: true,
        opacity: palette.opacity,
        depthWrite: false
    });

    const accentMaterial = new THREE.LineBasicMaterial({
        color: palette.accent,
        transparent: true,
        opacity: Math.min(palette.opacity + 0.06, 1),
        depthWrite: false
    });

    const primaryLines = new THREE.LineSegments(
        createSegmentsGeometry(primaryPoints),
        primaryMaterial
    );

    const accentLines = new THREE.LineSegments(
        createSegmentsGeometry(accentPoints),
        accentMaterial
    );

    primaryLines.renderOrder = 2;
    accentLines.renderOrder = 2;

    group.add(primaryLines, accentLines);

    return group;
}

// =====================================================
// ЦИФРЫ НА ГРАНЯХ
// =====================================================

for (const face of faces) {
    const worldUp = new THREE.Vector3(0, 1, 0);

    const up = worldUp.clone().addScaledVector(
        face.normal,
        -worldUp.dot(face.normal)
    );

    if (up.lengthSq() < 0.001) {
        up.set(1, 0, 0).addScaledVector(
            face.normal,
            -face.normal.x
        );
    }

    up.normalize();
    face.up = up.clone();

    const right = new THREE.Vector3()
        .crossVectors(up, face.normal)
        .normalize();

    face.right = right.clone();

    const basis = new THREE.Matrix4().makeBasis(
        right,
        up,
        face.normal
    );

    const labelMaterial = new THREE.MeshBasicMaterial({
        map: createNumberTexture(face.number, skins[0].numbers),
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
    });

    const label = new THREE.Mesh(
        new THREE.PlaneGeometry(0.28, 0.28),
        labelMaterial
    );

    label.position.copy(face.center)
        .addScaledVector(face.normal, 0.015);

    label.quaternion.setFromRotationMatrix(basis);
    label.renderOrder = 4;

    face.label = label;
    dice.add(label);
}

const ornamentGroups = {
    cosmic: buildOrnamentGroup("cosmic"),
    gold: buildOrnamentGroup("gold"),
    infernal: buildOrnamentGroup("infernal")
};

dice.add(
    ornamentGroups.cosmic,
    ornamentGroups.gold,
    ornamentGroups.infernal
);

// =====================================================
// ПРИМЕНЕНИЕ СКИНА
// =====================================================

function applySkin(skinIndex) {
    const skin = skins[skinIndex];

    if (!skin) return;

    const textures = textureSets[skin.texture];

    bodyMaterial.map = textures.texture;
    bodyMaterial.emissiveMap = textures.emissiveTexture;
    bodyMaterial.color.setHex(skin.body);
    bodyMaterial.emissive.setHex(skin.glow);
    bodyMaterial.emissiveIntensity = skin.emissiveIntensity;
    bodyMaterial.metalness = skin.metalness;
    bodyMaterial.roughness = skin.roughness;
    bodyMaterial.needsUpdate = true;

    edgeMaterial.color.setHex(skin.edges);

    edgeMaterial.opacity = skinIndex === 2 ? 0.72 : 1;

    ambientLight.color.setHex(skin.ambient);
    mainLight.color.setHex(skin.light);
    magicLight.color.setHex(skin.glow);
    magicLight.intensity = skin.glowIntensity;
    rimLight.color.setHex(skin.light);

    for (const [name, group] of Object.entries(ornamentGroups)) {
        group.visible = name === skin.ornament;
    }

    for (const face of faces) {
        const material = face.label.material;

        if (material.map) {
            material.map.dispose();
        }

        material.map = createNumberTexture(
            face.number,
            skin.numbers
        );

        material.needsUpdate = true;
    }
}

// Начальный вид кубика
applySkin(0);
dice.rotation.set(0.25, 0.35, 0.1);

// =====================================================
// РАЗМЕРЫ СЦЕНЫ
// =====================================================

function resizeScene() {
    const width = diceSpace.clientWidth;
    const height = diceSpace.clientHeight;

    if (width <= 0 || height <= 0) return;

    renderer.setSize(width, height, false);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

const resizeObserver = new ResizeObserver(resizeScene);
resizeObserver.observe(diceSpace);
resizeScene();

// =====================================================
// ПОСТОЯННОЕ ВРАЩЕНИЕ
// =====================================================

let rolling = false;
let pausedAfterRoll = false;
let pauseTimer = null;

function animate() {
    requestAnimationFrame(animate);

    if (!rolling && !pausedAfterRoll) {
        dice.rotation.y += 0.002;
    }

    renderer.render(scene, camera);
}

animate();

// Ориентация выпавшей грани
function getTargetRotation(face) {
    const right = new THREE.Vector3()
        .crossVectors(face.up, face.normal)
        .normalize();

    const basis = new THREE.Matrix4().makeBasis(
        right,
        face.up,
        face.normal
    );

    return new THREE.Quaternion()
        .setFromRotationMatrix(basis)
        .invert();
}

// =====================================================
// БРОСОК КУБИКА
// =====================================================

rollButton.addEventListener("click", () => {
    if (rolling) return;

    if (pauseTimer !== null) {
        clearTimeout(pauseTimer);
        pauseTimer = null;
    }

  
pausedAfterRoll = false;
rolling = true;
rollButton.disabled = true;

// Звук запускается вместе с броском.
startBackgroundMusic();
playRollSound();


    const result = Math.floor(Math.random() * 20) + 1;

    const targetFace = faces.find(
        (face) => face.number === result
    );

    if (!targetFace) {
        rolling = false;
        rollButton.disabled = false;
        return;
    }

    const targetQuaternion = getTargetRotation(targetFace);
    const targetEuler = new THREE.Euler()
        .setFromQuaternion(targetQuaternion, "XYZ");

    const startX = dice.rotation.x;
    const startY = dice.rotation.y;
    const startZ = dice.rotation.z;

    const targetX = targetEuler.x +
        Math.PI * 2 * (2 + Math.floor(Math.random() * 3));

    const targetY = targetEuler.y +
        Math.PI * 2 * (2 + Math.floor(Math.random() * 3));

    const targetZ = targetEuler.z +
        Math.PI * 2 * (1 + Math.floor(Math.random() * 3));

    const startTime = performance.now();
    const duration = 1700;

    resultMessage.textContent = "куб вращается...";

    function rollAnimation(now) {
        const progress = Math.min(
            (now - startTime) / duration,
            1
        );

        const eased = 1 - Math.pow(1 - progress, 4);

        dice.rotation.set(
            startX + (targetX - startX) * eased,
            startY + (targetY - startY) * eased,
            startZ + (targetZ - startZ) * eased
        );

        if (progress < 1) {
            requestAnimationFrame(rollAnimation);
            return;
        }

        dice.quaternion.copy(targetQuaternion);

        rolling = false;
        pausedAfterRoll = true;

        if (result === 20) {
            resultMessage.innerHTML =
                '<span class="critical win">КРИТИЧЕСКИЙ УСПЕХ!</span>' +
                '<span class="number">20</span>';
        } else if (result === 1) {
            resultMessage.innerHTML =
                '<span class="critical fail">КРИТИЧЕСКИЙ ПРОВАЛ!</span>' +
                '<span class="number">1</span>';
        } else {
            resultMessage.innerHTML =
                `<span class="number">${result}</span>`;
        }

        rollButton.disabled = false;

        pauseTimer = setTimeout(() => {
            pausedAfterRoll = false;
            pauseTimer = null;
        }, 5000);
    }

    requestAnimationFrame(rollAnimation);
});

// =====================================================
// ПЕРЕКЛЮЧАТЕЛЬ ЗВУКА
// =====================================================


let musicOn = true;
let effectsOn = true;

const musicButton = document.getElementById("music-toggle");
const musicIcon = document.getElementById("music-icon");
const effectsButton = document.getElementById("effects-toggle");
const effectsIcon = document.getElementById("effects-icon");

const backgroundMusic = new Audio("sounds/ambient.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.12;

let musicStarted = false;


function startBackgroundMusic() {
    if (!musicOn) return;

    backgroundMusic.play()
        .then(() => {
            musicStarted = true;
        })
        .catch(() => {
            // Браузер мог запретить автозапуск.
            // Попробуем снова при первом взаимодействии.
        });
}

// Пробуем включить музыку при открытии страницы.
startBackgroundMusic();

// Если браузер заблокировал автозапуск,
// повторяем попытку при первом взаимодействии.
function startMusicOnFirstInteraction() {
    if (!musicOn || musicStarted) return;

    startBackgroundMusic();

    if (musicStarted) {
        document.removeEventListener(
            "pointerdown",
            startMusicOnFirstInteraction
        );
        document.removeEventListener(
            "keydown",
            startMusicOnFirstInteraction
        );
    }
}

document.addEventListener(
    "pointerdown",
    startMusicOnFirstInteraction
);

document.addEventListener(
    "keydown",
    startMusicOnFirstInteraction
);


const diceRollAudio = new Audio("sounds/dice-roll.mp3");
diceRollAudio.preload = "auto";
diceRollAudio.volume = 0.7;

function playRollSound() {
    if (!effectsOn) return;

    diceRollAudio.currentTime = 0;

    diceRollAudio.play().catch((error) => {
        console.warn("Не удалось воспроизвести звук:", error);
    });
}

function updateMusicButton() {
    if (!musicButton || !musicIcon) return;

    if (musicOn) {
        musicIcon.innerHTML = `
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
        `;
        musicButton.setAttribute("aria-label", "Выключить музыку");
        musicButton.setAttribute("aria-pressed", "true");
    } else {
        musicIcon.innerHTML = `
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
            <path d="M3 3l18 18"/>
        `;
        musicButton.setAttribute("aria-label", "Включить музыку");
        musicButton.setAttribute("aria-pressed", "false");
    }
}

function updateEffectsButton() {
    if (!effectsButton || !effectsIcon) return;

    if (effectsOn) {
        effectsIcon.innerHTML = `
            <path d="M11 5 6 9H3v6h3l5 4V5Z"/>
            <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
            <path d="M19 5a10 10 0 0 1 0 14"/>
        `;
        effectsButton.setAttribute("aria-label", "Выключить звуковые эффекты");
        effectsButton.setAttribute("aria-pressed", "true");
    } else {
        effectsIcon.innerHTML = `
            <path d="M11 5 6 9H3v6h3l5 4V5Z"/>
            <path d="M16 9l5 6m0-6-5 6"/>
            <path d="M3 3l18 18"/>
        `;
        effectsButton.setAttribute("aria-label", "Включить звуковые эффекты");
        effectsButton.setAttribute("aria-pressed", "false");
    }
}

if (musicButton) {
    musicButton.addEventListener("click", () => {
        musicOn = !musicOn;

        if (musicOn) {
            startBackgroundMusic();
        } else {
            backgroundMusic.pause();
        }

        updateMusicButton();
    });
}

if (effectsButton) {
    effectsButton.addEventListener("click", () => {
        effectsOn = !effectsOn;

        if (!effectsOn) {
            diceRollAudio.pause();
            diceRollAudio.currentTime = 0;
        }

        updateEffectsButton();
    });
}

updateMusicButton();
updateEffectsButton();

// =====================================================
// ПЕРЕКЛЮЧЕНИЕ СКИНОВ
// =====================================================

skinButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        skinButtons.forEach((option) => {
            option.classList.remove("active");
            option.setAttribute("aria-pressed", "false");
        });

        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");

        applySkin(index);
    });
});

skinButtons.forEach((button) => {
    button.setAttribute(
        "aria-pressed",
        button.classList.contains("active") ? "true" : "false"
    );
});




/* =========================================================
   ATMOSPHERIC EFFECTS
   Светлячки с мягким свечением и туман у земли.
   ========================================================= */

(() => {
    const game = document.querySelector(".game");
    const background = document.querySelector(".background");
    const arch = document.querySelector(".arch");
    const content = document.querySelector(".content");

    if (!game || !background || !arch || !content) return;

    // Не создаём второй комплект эффектов.
    if (game.querySelector("#atmosphere-far")) return;

    background.style.zIndex = "0";
    arch.style.zIndex = "2";
    content.style.zIndex = "4";

    function createLayer(id, zIndex) {
        const canvas = document.createElement("canvas");
        canvas.id = id;

        Object.assign(canvas.style, {
            position: "absolute",
            inset: "0",
            width: "100%",
            height: "100%",
            display: "block",
            zIndex: String(zIndex),
            pointerEvents: "none",
            userSelect: "none"
        });

        game.appendChild(canvas);

        return {
            canvas,
            ctx: canvas.getContext("2d")
        };
    }

    const farLayer = createLayer("atmosphere-far", 1);
    const nearLayer = createLayer("atmosphere-near", 3);

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationId = 0;
    let lastTime = 0;
    let elapsed = 0;

    const colors = [
        [111, 225, 205], // бирюзовый
        [113, 176, 255], // голубой
        [237, 198, 112], // старое золото
        [190, 151, 239], // сиреневый
        [213, 235, 174], // мягкий салатовый
        [255, 164, 133]  // янтарно-розовый
    ];

    function random(min, max) {
        return min + Math.random() * (max - min);
    }

    function createFireflies(count, type) {
        const far = type === "far";

        return Array.from({ length: count }, () => {
            const y = Math.random() < 0.78
                ? random(0.70, 0.96)
                : random(0.48, 0.72);

            return {
                x: random(0.02, 0.98),
                y,
                radius: far ? random(1.5, 2.5) : random(2.0, 3.5),
                speedX: random(-0.00016, 0.00016),
                speedY: random(-0.000045, 0.000045),
                phase: random(0, Math.PI * 2),
                pulseSpeed: random(0.35, 0.8),
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: far ? random(0.45, 0.7) : random(0.6, 0.95),
                drift: random(0.001, 0.004),
                far
            };
        });
    }

    const farFireflies = createFireflies(20, "far");
    const nearFireflies = createFireflies(25, "near");

    function resize() {
        const rect = game.getBoundingClientRect();

        width = rect.width;
        height = rect.height;
        pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

        for (const layer of [farLayer, nearLayer]) {
            layer.canvas.width = Math.round(width * pixelRatio);
            layer.canvas.height = Math.round(height * pixelRatio);
            layer.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        }
    }

    // Светлячки растворяются к верхней части сцены.
    function bottomFade(y) {
        if (y <= 0.34) return 0;
        if (y >= 0.66) return 1;

        const t = (y - 0.34) / 0.32;
        return t * t * (3 - 2 * t);
    }

    // Мягкое свечение: градиент от яркого центра к прозрачности.
    // Каждый слой имеет плавный край, без stroke и контуров.
    function drawGlow(ctx, x, y, radius, color, intensity, stops) {
        const [r, g, b] = color;

        const gradient = ctx.createRadialGradient(
            x, y, 0,
            x, y, radius
        );

        for (const [position, opacity] of stops) {
            gradient.addColorStop(
                position,
                `rgba(${r}, ${g}, ${b}, ${Math.max(0, intensity * opacity)})`
            );
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawFirefly(ctx, fly) {
        const pulse =
            (Math.sin(elapsed * fly.pulseSpeed + fly.phase) + 1) / 2;

        const fade = bottomFade(fly.y);
        if (fade <= 0.01) return;

        const x = fly.x * width;
        const y = fly.y * height;
        const scale = Math.max(0.85, width / 380);
        const radius = fly.radius * scale;
        const [r, g, b] = fly.color;

        const intensity =
            fly.alpha * fade * (0.65 + pulse * 0.35);

        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        // 1. Очень широкий, едва заметный ореол.
        drawGlow(
            ctx, x, y, radius * (fly.far ? 16 : 20),
            fly.color, intensity,
            [
                [0, 0.10],
                [0.12, 0.075],
                [0.30, 0.040],
                [0.58, 0.014],
                [0.82, 0.004],
                [1, 0]
            ]
        );

        // 2. Основное цветное рассеивание вокруг огонька.
        drawGlow(
            ctx, x, y, radius * (fly.far ? 7 : 9),
            fly.color, intensity,
            [
                [0, 0.28],
                [0.10, 0.23],
                [0.25, 0.13],
                [0.48, 0.055],
                [0.75, 0.012],
                [1, 0]
            ]
        );

        // 3. Небольшой насыщенный ореол у самого ядра.
        drawGlow(
            ctx, x, y, radius * 3,
            fly.color, intensity,
            [
                [0, 0.30],
                [0.20, 0.20],
                [0.50, 0.07],
                [0.80, 0.015],
                [1, 0]
            ]
        );

        // 4. Ядро тоже градиентное — без сплошного кружка.
        const coreRadius = radius * 1.2;
        const core = ctx.createRadialGradient(
            x - radius * 0.12,
            y - radius * 0.12,
            0,
            x, y, coreRadius
        );

        core.addColorStop(
            0,
            `rgba(255, 255, 240, ${intensity * 0.95})`
        );
        core.addColorStop(
            0.18,
            `rgba(255, 248, 225, ${intensity * 0.75})`
        );
        core.addColorStop(
            0.42,
            `rgba(${r}, ${g}, ${b}, ${intensity * 0.48})`
        );
        core.addColorStop(
            0.72,
            `rgba(${r}, ${g}, ${b}, ${intensity * 0.12})`
        );
        core.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(x, y, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        // Маленькая светлая искра в центре.
        ctx.fillStyle =
            `rgba(255, 255, 245, ${intensity * pulse * 0.8})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.45, radius * 0.16), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function updateFireflies(fireflies, dt) {
        const step = Math.min(dt, 40) / 16.67;

        for (const fly of fireflies) {
            fly.x += fly.speedX * step;
            fly.y += fly.speedY * step;

            // Медленное естественное покачивание.
            fly.y += Math.sin(elapsed * 0.18 + fly.phase)
                * fly.drift * step * 0.025;

            if (fly.y < 0.43) {
                fly.y = random(0.76, 0.96);
                fly.x = random(0.02, 0.98);
            }

            if (fly.y > 0.99) {
                fly.y = random(0.68, 0.86);
            }

            if (fly.x < -0.04) fly.x = 1.04;
            if (fly.x > 1.04) fly.x = -0.04;
        }
    }

    // Туман у земли.
    function drawFog(ctx, x, y, radiusX, radiusY, opacity, speed, phase) {
        const fogX =
            x + Math.sin(elapsed * speed + phase) * width * 0.045;

        const fogY =
            y + Math.sin(elapsed * speed * 0.55 + phase) * height * 0.009;

        const breathe = 0.8 +
            (Math.sin(elapsed * 0.12 + phase) + 1) * 0.1;

        ctx.save();
        ctx.translate(fogX, fogY);
        ctx.scale(1, radiusY / radiusX);

        const gradient = ctx.createRadialGradient(
            0, 0, radiusX * 0.04,
            0, 0, radiusX
        );

        gradient.addColorStop(
            0,
            `rgba(154, 169, 157, ${opacity * breathe})`
        );
        gradient.addColorStop(
            0.38,
            `rgba(126, 146, 133, ${opacity * breathe * 0.72})`
        );
        gradient.addColorStop(
            0.72,
            `rgba(102, 123, 111, ${opacity * breathe * 0.28})`
        );
        gradient.addColorStop(1, "rgba(88, 107, 96, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radiusX, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function drawFarLayer() {
        const ctx = farLayer.ctx;
        ctx.clearRect(0, 0, width, height);

        drawFog(
            ctx, width * 0.25, height * 0.84,
            width * 0.58, height * 0.20,
            0.105, 0.035, 0
        );

        drawFog(
            ctx, width * 0.82, height * 0.89,
            width * 0.48, height * 0.16,
            0.09, 0.027, 2
        );

        for (const fly of farFireflies) {
            drawFirefly(ctx, fly);
        }
    }

    function drawNearLayer() {
        const ctx = nearLayer.ctx;
        ctx.clearRect(0, 0, width, height);

        drawFog(
            ctx, width * 0.18, height * 0.96,
            width * 0.62, height * 0.24,
            0.16, 0.045, 1
        );

        drawFog(
            ctx, width * 0.78, height * 0.91,
            width * 0.53, height * 0.20,
            0.13, 0.038, 4
        );

        drawFog(
            ctx, width * 0.50, height * 1.015,
            width * 0.72, height * 0.21,
            0.19, 0.03, 2.5
        );

        for (const fly of nearFireflies) {
            drawFirefly(ctx, fly);
        }
    }

    function animate(time = 0) {
        if (document.hidden) {
            animationId = 0;
            lastTime = 0;
            return;
        }

        const dt = lastTime
            ? Math.min(time - lastTime, 40)
            : 16.67;

        lastTime = time;
        elapsed += dt / 1000;

        updateFireflies(farFireflies, dt);
        updateFireflies(nearFireflies, dt);

        drawFarLayer();
        drawNearLayer();

        animationId = requestAnimationFrame(animate);
    }

    function start() {
        if (!animationId && !document.hidden) {
            lastTime = 0;
            animationId = requestAnimationFrame(animate);
        }
    }

    function stop() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = 0;
        }
    }

    resize();

    if ("ResizeObserver" in window) {
        new ResizeObserver(resize).observe(game);
    } else {
        window.addEventListener("resize", resize, { passive: true });
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    });

    start();
})();
