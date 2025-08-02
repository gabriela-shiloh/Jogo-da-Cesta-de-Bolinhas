import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from "cannon";
import {GUI} from "dat.gui";

const RAIOESFERA = 0.4;
let score = 0;

// Criar cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x5555FF);

const aspectRatio = window.innerWidth / window.innerHeight;

// Criar câmera
const zoom = 10;
const camera = new THREE.OrthographicCamera(-zoom*aspectRatio, zoom*aspectRatio, zoom, -zoom, -10000, 10000);
camera.position.set(0,8,1);

// Criar listener para tocar áudio
const listener = new THREE.AudioListener();
camera.add(listener);

// Criar renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Criar luz 
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Criar mundo físico
const mundo = new CANNON.World();
mundo.gravity.set(0, -0.5, 0);
mundo.frequencia = 600;

// Criar visual do chão
const geometriaChao = new THREE.BoxGeometry(100, 5, 100);
const materialChao = new THREE.MeshNormalMaterial()
const chao = new THREE.Mesh(geometriaChao,materialChao);
chao.position.y = -4;
scene.add(chao);

// Criar corpo físico do chão
const bodyChao = new CANNON.Body({
    mass: 0,    //Corpo estático
    position: new CANNON.Vec3(0, -1.5, 0),
});
bodyChao.addShape(new CANNON.Plane());
bodyChao.quaternion.setFromEuler(-Math.PI/2, 0, 0);

mundo.addBody(bodyChao);

// Carregar modelo 3D da cesta
let cesta;
const loader = new GLTFLoader();
loader.load('./assets/scene.gltf', (gltf) => {
    gltf.scene.traverse(node => {
        if (node.isMesh) {
            node.material.opacity = 0.9;
            node.material.transparent = true;
        }
    });
    cesta = gltf.scene;    
    console.log(cesta);
    cesta.scale.set(2,2,2);
    scene.add(cesta);
});

// Criar o corpo físico e o shape da cesta
const bodyCesta = new CANNON.Body({
    mass: 0,    // Corpo estático
    position: new CANNON.Vec3(0, 0, 0)
});
mundo.addBody(bodyCesta);

// Criar cada parede da cesta
function criarParede(largura, altura, profundidade, x, y, z) {
    bodyCesta.addShape(
        new CANNON.Box(new CANNON.Vec3(largura/2, altura/2, profundidade/2)),
        new CANNON.Vec3(x, y, z)
    );
}

const cestaLargura = 4;
const cestaAltura = 3;
const cestaProfundidade = 4;
const espessura = 0.5;
criarParede(espessura, cestaAltura, cestaProfundidade, -2, 0, 0);
criarParede(espessura, cestaAltura, cestaProfundidade, 2, 0, 0);
criarParede(cestaLargura, cestaAltura, espessura, 0, 0, -2);
criarParede(cestaLargura, cestaAltura, espessura, 0, 0, 2);
criarParede(cestaLargura, espessura, cestaProfundidade, 0, -1.5, 0);


let destinoX = 0;
let audioCtx;
// Fazer a cesta seguir o mouse
function seguirMouse() {
    document.onmousemove = (event) => {
        if(cesta) {
            destinoX = (event.pageX - window.innerWidth/2)/30;
        }

        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
}

let meshesBolinhas = [];
let bodiesBolinhas = []; 

// Cria uma bola usando sistema de partículas
function criarBolinha() {
     // Posição inicial aleatória do centro da bolinha
    const centroX = (Math.random() - 0.5) * window.innerWidth/30;
    let tipo;
    let r = Math.random();
    if(r <= 0.2) {
        tipo = "vidro"
    }
    else if(r <= 0.4) {
        tipo = "metal"
    } else {
        tipo = "comum"
    }

    const meshBolinha = new THREE.Object3D;

    let densidade = 1024;

    // Cria geometria para as partículas
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(densidade * 3); // x, y, z para cada partícula
    const colors = new Float32Array(densidade * 3);  // r, g, b para cada partícula
    var offset = 2 / densidade;
    var increment = Math.PI * (3 - Math.sqrt(5));

    // Gerar partículas para formar uma esfera
    for (let i = 0; i < densidade; i++) {
        var y = ((i * offset) - 1) + (offset / 2);
        var distance = Math.sqrt(1 - Math.pow(y, 2));
        var phi = ((i + 1) % densidade) * increment;
        var x = Math.cos(phi) * distance;
        var z = Math.sin(phi) * distance;

        // Posições iniciais 
        positions[i * 3] = x * RAIOESFERA;     // x
        positions[i * 3 + 1] = y * RAIOESFERA;  // y
        positions[i * 3 + 2] = z * RAIOESFERA;  // z

        // Cores iniciais
        switch(tipo) {
            case "comum":
                    colors[i * 3] = 1;
                    colors[i * 3 + 1] = 1;
                    colors[i * 3 + 2] = 1;
                    break;
            case "vidro":
                if((x**2 + y**2) > 0.9) {
                    colors[i * 3] = 1;
                    colors[i * 3 + 1] = 1;
                    colors[i * 3 + 2] = 1;
                } else {
                    colors[i * 3] = 0;
                    colors[i * 3 + 1] = 0;
                    colors[i * 3 + 2] = 0;
                }                
                break;
            case "metal":
                let distancia = (x**2 + y**2)

                colors[i * 3] = (1-distancia)/2 + 0.2;
                colors[i * 3 + 1] = (1-distancia)/2 + 0.1;
                colors[i * 3 + 2] = (1-distancia)/2 + 0.1;             
                break;
        }
    }

    // Configura os atributos da geometria
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Cria material das partículas
    const particlesMaterial = new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.NormalBlending
    });

    // Cria o sistema de partículas
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    if(tipo == "vidro") {
        particles.material.blending = THREE.AdditiveBlending;
    }

    meshBolinha.add(particles);
    scene.add(meshBolinha);

    // Criar corpo físico das bolinhas
    const bodyBolinha = new CANNON.Body({
        mass: 0.1,
        position: new CANNON.Vec3(centroX, 19, 0)
    });
    bodyBolinha.addShape(new CANNON.Sphere(RAIOESFERA));

    bodyBolinha.ponto = true;
    bodyBolinha.colidiu = false;

    // Eventos especiais de colisão
    bodyBolinha.addEventListener("collide", (event) => {
        if(bodyBolinha.ponto && event.body === bodyCesta) {
            const posBolinha = bodyBolinha.position;
            const posCesta = bodyCesta.position;
            const dentroX = posBolinha.x > posCesta.x - cestaProfundidade / 2 && posBolinha.x < posCesta.x + cestaProfundidade / 2;
            const dentroZ = posBolinha.z > posCesta.z - cestaProfundidade / 2 && posBolinha.z < posCesta.z + cestaProfundidade / 2;

            if(dentroX && dentroZ) {
                const audioLoader = new THREE.AudioLoader();
                const som = new THREE.Audio(listener);
                // Tocar som quando toca na cesta
                audioLoader.load("../assets/mario_coin_sound.mp3", function(buffer) {
                    som.setBuffer(buffer);
                    som.setLoop(false);
                    som.setVolume(0.2);
                    som.play();
                });

                // Atualizar pontuação
                if(tipo == "metal") {
                    score += 2;
                } else {
                    score++;
                }
                bodyBolinha.ponto = false;
            }
        }

        // Perder ponto se deixar uma bolinha de vidro cair
        if(!bodyBolinha.colidiu && event.body === bodyChao && tipo == "vidro") {
                score--;
        }

        if(!bodyBolinha.colidiu && (event.body === bodyChao || event.body === bodyCesta)) {
            bodyBolinha.colidiu = true;
        }
    });

    mundo.addBody(bodyBolinha);
    meshesBolinhas.push(meshBolinha);
    bodiesBolinhas.push(bodyBolinha);

    return meshBolinha;
}

// Lidar com redimensionamento da janela
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);   
});

// Dat GUI
const gui = new GUI();
const bolinhasFolder = gui.addFolder("Bolinhas");
bolinhasFolder.add(mundo.gravity, "y", -5, -0.1);
bolinhasFolder.add(mundo, "frequencia", 1, 950);


let tempo = 0;
let limpar = false;

// Função de animação
function animate() {
    requestAnimationFrame(animate);

    tempo++;

    // Criar bolinhas baseadas na frequência
    if(tempo >= 1000.1 - mundo.frequencia) {
        criarBolinha();
        tempo = 0;
    }

    if(score % 10 == 0 && score > 0) {
        limpar = true;
    }

    document.getElementById("info").innerHTML = `
        Pontos: ${score}
        `;

    mundo.step(1 / 60);

    
    for(let i = 0; i < meshesBolinhas.length; i++) {
        // Criando uma ligação entre o corpo físico e o visual das bolinhas
        meshesBolinhas[i].position.copy(bodiesBolinhas[i].position);
        meshesBolinhas[i].quaternion.copy(bodiesBolinhas[i].quaternion);

        // impedindo que as bolinhas saiam da cesta
        if(bodiesBolinhas[i].colidiu) {
            bodiesBolinhas[i].velocity.y = -2;
            bodiesBolinhas[i].velocity.x *= 0.5;
            bodiesBolinhas[i].velocity.z *= 0.5;
        }

        if(limpar && bodiesBolinhas[i].ponto == 0) {
            mundo.remove(bodiesBolinhas[i]);
            scene.remove(meshesBolinhas[i]);
            bodiesBolinhas.splice(i, 1);
            meshesBolinhas.splice(i, 1);

            limpar = false;
        }
    }    

    //Limitar a velocidade da cesta para evitar que as bolinhas atravessem
    if(cesta) {
        let delta = 0;

        const maxVel = 0.13;
        delta = destinoX - cesta.position.x;
        const mover = Math.max(-maxVel, Math.min(maxVel, delta));

        cesta.position.x += mover;
        bodyCesta.position.x = cesta.position.x;
    }

    // Renderizar cena
    renderer.render(scene, camera);
}

//Inicializar


seguirMouse();
animate();