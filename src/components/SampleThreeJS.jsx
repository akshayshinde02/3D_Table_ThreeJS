import React, { useEffect } from 'react'
import * as THREE from 'three';
import { useRef } from 'react';

const Table = () => {
  // console.log(THREE)

  const canvasRef = useRef(null);
  
  useEffect (() =>{

    // Check if the canvas is available
    if(!canvasRef.current) return;

    
  // 1. Creating a Scene
  const scene = new THREE.Scene();

  // 2. Creating basic Geometry
  const geometry = new THREE.BoxGeometry(1,1,1);
  const material = new THREE.MeshBasicMaterial({color:0xff0000});

  // 3. Creating Mesh class
  const mesh = new THREE.Mesh(geometry,material);

  // 4. adding to scene
  scene.add(mesh);

  // 5. Creating Camera
  const size = {
    width: 800,
    height: 600
  }

  const camera = new THREE.PerspectiveCamera(75, size.width / size.height,0.1, 1000);
  camera.position.z =5;
  
  // scene.add(camera);

  // 6. Creating Renderer

   
   const canvas = canvasRef.current;

   const renderer = new THREE.WebGLRenderer({
    canvas:canvas,
   });

   renderer.setSize(size.width,size.height);

   
   const animate =() =>{
     requestAnimationFrame(animate);
     renderer.render(scene, camera);
    
   }
   animate();

   // cleanup Function
   return () =>{
    renderer.dispose();
   }

  },[]);

 

  return (
    <canvas ref={canvasRef} className='webgl'>

    </canvas>
  )
}

export default Table