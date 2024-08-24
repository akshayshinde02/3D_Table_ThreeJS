import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SketchPicker } from "react-color";
import { GLTFExporter } from "three/examples/jsm/Addons.js";

import colorPickerIcon from './assets/swatch.png'
import uploadIcon from './assets/file.png'
import downloadIcon from './assets/images.png'

const App = () => {
  const mountRef = useRef(null);    // for Canvas
  const modelRef = useRef(null);   // for 3D Model
  const [color, setColor] = useState("#4A4A4A");
  const [texture, setTexture] = useState(null);
  const fileInputRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {

    // 1. Creating Scene - Scene is setup what and where to be rendered by Three.js ( Objects, Lights and Cameras)
    const scene = new THREE.Scene();
    // Giving Default Background Color
    scene.background = new THREE.Color("#ffffff");

    // 2. Creating a Camera -  Perspective Camera designed to mimic way the Human eye sees Parameter( Vertical View, Aspect Reatio, near plane, far plane)
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // 3. Creating Renderer used to display Scenes
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);  // Append the Canvas Output

    // 4. Adding the Ambient Light - Illumination Purpose (0x404040 - White Light)
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Illumination In One Direction - Directional Light( COlor, Intensity)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // 5. Loading The GLTF (3D File)
    const loader = new GLTFLoader();
    loader.load(
      "/table_and_chairs.glb",
      (gltf) => {
        modelRef.current = gltf.scene;  // Containd GLTF 3D scene
        scene.add(modelRef.current);
        modelRef.current.position.set(0, 0, 0);
        modelRef.current.scale.set(1, 1, 1);

        // Applying Choosing Color From User
        applyColorToModel(color);

        // Applying Choosing Texture (JPEG Image) From User
        if (texture) {
          applyTextureToModel(texture);
        }
      },
      undefined,
      (error) => {
        console.error("An error happened while loading the model:", error);
      }
    );

    // Fixing Camera Position
    camera.position.x = 2;
    camera.position.y = 1;
    camera.position.z = 0;

    // 6 Orbit Controls - used for rotate, zoom and view scene from different angle - (camera, renderer.domElement) -> renderer.domElement(<canvas>) listen for user input (e.g. mouse movements) to control the camera.
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;  // Smooth Transition Effect
    controls.dampingFactor = 0.25;  // Control daming Effect
    controls.enableZoom = true;     // Zoom in and out

    // 7. Use to smooth and continuous rendering of 3D scene
    const animate = () => {
      requestAnimationFrame(animate);  // calls animate funtion when browser is repainted
      controls.update();               // handles user inputs (such as mouse movements) to change the camera's position and orientation.
      renderer.render(scene, camera);
    };
    animate();

    // Clean Up Code
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [color, texture]);   // Any Changes in Color or Texture Repainted

  // 8. Apply Color to Model
  const applyColorToModel = (colorHex) => {
    if (modelRef.current) {                   // modelRef.current - 3D model exist or not
      modelRef.current.traverse((child) => {  //  traverse child Objects(meshes (Combination of Geometry and Materials)
        if (child.isMesh) {                   // Only Geometry and Materials shall procees not ligths and cameras
          if (
            child.material instanceof THREE.MeshStandardMaterial ||
            child.material instanceof THREE.MeshBasicMaterial
          ) {
            child.material.color.set(colorHex);   // convert hex color to three js formate
            child.material.emissive.set(colorHex); // glowing and apply
            child.material.map = null;             // clearing all texture leaving only color
            child.material.needsUpdate = true;     // Marks the material as needing an update
          }
        }
      });
    }
  };

  // 9. Apply Texture to Model
  const applyTextureToModel = (texture) => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          // Apply the uploaded texture
          const darkenedTexture = texture.clone();

          // Ensures the texture will repeat across the mesh’s surface rather than stretching.
          darkenedTexture.wrapS = THREE.RepeatWrapping;
          darkenedTexture.wrapT = THREE.RepeatWrapping;
          darkenedTexture.repeat.set(3.3, 3.3); 
          darkenedTexture.center.set(0.5, 0.5);

          // Create a new material with the darkened texture
          const darkMaterial = new THREE.MeshStandardMaterial({
            map: darkenedTexture,
            color: new THREE.Color(color), // Original color for the material
          });

          // Set the new material to the mesh
          child.material = darkMaterial;

          child.material.needsUpdate = true;
        }
      });
    }
  };

  // Handling Color Change
  const handleColorChange = (color) => {
    setColor(color.hex);
    applyColorToModel(color.hex);
  };

  // Upload JPEG Image
  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file && file.type.startsWith("image/jpeg")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const textureLoader = new THREE.TextureLoader();
        const newTexture = textureLoader.load(e.target.result, () => {
          setTexture(newTexture);
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a JPEG file.");
    }
  };

 
  // 10. Save Design
  const saveDesign =()=>{
    if(modelRef.current){
      const exporter = new GLTFExporter();
      exporter.parse(modelRef.current, (result) =>{
        const output = JSON.stringify(result, null, 2);
        const blob = new Blob([output], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Creating Dynamic Anchor Tag
        const link = document.createElement('a');
        link.href = url;
        link.download = 'DiningTable.glb';
        document.body.appendChild(link);
        link.click();

        // CleanUP code
        document.body.removeChild(link);
      })
    }
  }
   
  const handleColorPickerClick = () => {
    setShowColorPicker(!showColorPicker);
  };


  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", top: 10, left: 10 }}>
     
        <button
          onClick={handleColorPickerClick}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
            <img
            src = {colorPickerIcon}
            style={{ width: 40, height: 40 }}
            />
            <p>Color Picker</p> 
        </button>
        {showColorPicker && (
          <div style={{ position: 'absolute', top: 50 }}>
            <SketchPicker color={color} onChangeComplete={handleColorChange} />
          </div>
        )}

        <button
          onClick={() => fileInputRef.current.click()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 10 }}
        >
          <img
            src={uploadIcon}
            alt="Upload File"
            style={{ width: 40, height: 40 }}
          />
          <p>Upload Logo</p>
        </button>

        <input
        ref={fileInputRef}
          type="file"
          accept="image/jpeg"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

        < button
        onClick={saveDesign}
        style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 10 }}
        >
          <img
            src={downloadIcon}
            alt="Upload File"
            style={{ width: 40, height: 40 }}
          />
          <p>Save Design</p></button>
      </div>
    </div>
  );
};

export default App;
