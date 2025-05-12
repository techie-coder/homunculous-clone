import * as THREE from "three";
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from "dat.gui";
import gsap from "gsap";

import t1 from "../img/t1.png";
import t2 from "../img/t2.png";
import t3 from "../img/t3.png";

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { CustomPass } from './CustomPass.js';

import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { DotScreenShader } from 'three/examples/jsm/shaders/DotScreenShader.js';


export default class Sketch {
  constructor(options) {

    this.scene = new THREE.Scene();

    this.urls = [t1, t2, t3];
    console.log(this.urls);

    
    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1); 
    this.renderer.outputEncoding = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;
    
    this.textures = this.urls.map(url => new THREE.TextureLoader().load(url));
    console.log(this.textures);

    this.initPost();

    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    this.settings();

    
  }

  initPost() {
    this.composer = new EffectComposer( this.renderer );
		this.composer.addPass( new RenderPass( this.scene, this.camera ) );

		this.effect1 = new ShaderPass( CustomPass );
		this.effect1.uniforms[ 'time' ].value = 1;
		this.composer.addPass( this.effect1 );
    
    /*
		const effect2 = new ShaderPass( RGBShiftShader );
		effect2.uniforms[ 'amount' ].value = 0.0015;
		this.composer.addPass( effect2 );
    */

  }

  settings() {
    let that = this;
    this.settings = {
      progress: 1,
      scale: 1.3,
      radius: 0.2,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
    this.gui.add(this.settings, "scale", 0, 10, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        uTexture: { value: this.textures[0] },
        resolution: { type: "v4", value: new THREE.Vector4() },
        radius: {value: 0.1},
        mTexture: {value: new THREE.TextureLoader().load("../img/b1.png")},
        /*
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        }
        */
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment
    });


    this.geometry = new THREE.PlaneGeometry(1.7/2, 1/2, 1, 1);

    this.meshes = [];

    this.textures.forEach((t,i) => {
      let m = this.material.clone();
      m.uniforms.uTexture.value = t;
      let mesh = new THREE.Mesh(this.geometry, m);
      this.scene.add(mesh);
      this.meshes.push(mesh);
      mesh.position.x = i - 1 ;
    })

    //this.scene.add(this.plane);
  }


  render() {
    this.meshes.forEach((m,i) => {
      m.position.y = -this.settings.progress;
      m.rotation.z = this.settings.progress*Math.PI/2;
    })
    this.time += 0.005;
    this.material.uniforms.time.value = this.time;

    this.effect1.uniforms['time'].value = this.time;
    this.effect1.uniforms['progress'].value = this.settings.progress;
    this.effect1.uniforms['scale'].value = this.settings.scale;
    this.effect1.uniforms['radius'].value = this.settings.radius;
    requestAnimationFrame(this.render.bind(this));
    //this.renderer.render(this.scene, this.camera);
    this.composer.render();
  }
}

new Sketch({
  dom: document.getElementById("container")
});
