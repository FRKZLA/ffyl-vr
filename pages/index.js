import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [currentImage, setCurrentImage] = useState('/image/Hallway.jpg');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Función para cambiar la imagen a Office.jpg
  const changeScene = () => {
    setCurrentImage('/image/Office.jpg');
  };

  return (
    <div>
      <Head>
        <title>360° Image Viewer</title>
        <meta name="description" content="360° Image Viewer - A-Frame" />
      </Head>

      {/* Cargamos el script de A-Frame */}
      <Script src="https://aframe.io/releases/1.3.0/aframe.min.js" strategy="beforeInteractive" />

      {isClient ? (
        <a-scene vr-mode-ui="enabled: false"> {/* Deshabilitamos el Cardboard UI */}
          {/* Cámara con controles de vista para PC, móviles y VR */}
          <a-entity position="0 1.6 0">
            <a-camera look-controls="enabled: true; touchEnabled: true">
              <a-cursor
                raycaster="objects: .clickable"
                fuse="true"
                fuse-timeout="500"
                material="color: black; shader: flat"
                geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
              ></a-cursor>
            </a-camera>
          </a-entity>

          {/* Skybox con la imagen controlada por el estado */}
          <a-sky src={currentImage} rotation="0 0 0"></a-sky>

          {/* Botón interactivo para cambiar la escena */}
          <a-entity
            class="clickable"
            geometry="primitive: plane; width: 2; height: 0.8"
            material="color: #333"
            position="0 1.5 -3"
            text="value: Oficina; align: center"
            event-set__mouseenter="material.color: #7BC8A4"
            event-set__mouseleave="material.color: #333"
            onclick={changeScene}  // Cambia la escena cuando se hace clic
          ></a-entity>

          {/* Luces para mejorar la visibilidad */}
          <a-light type="ambient" color="#ffffff"></a-light>
          <a-light type="directional" position="-1 1 0" intensity="1"></a-light>
        </a-scene>
      ) : (
        <p>Cargando VR...</p>
      )}
    </div>
  );
}
