import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [currentImage, setCurrentImage] = useState('/image/Hallway.jpg');

  useEffect(() => {
    setIsClient(true); // Esto asegura que el componente se renderice solo en el cliente
  }, []);

  // Función para cambiar la imagen a Office.jpg
  const changeScene = () => {
    setCurrentImage('/image/Office.jpg');
  };

  return (
    <div>
      <Head>
        <title>FFyL 360°</title>
        <meta name="description" content="FFyL 360°" />
        {/* Agregar estilos para forzar la visibilidad del botón VR */}
        <style>{`
          .a-enter-vr-button {
            position: fixed !important;
            top: 10px !important;
            right: 10px !important;
            z-index: 9999 !important;
            visibility: visible !important;
          }
        `}</style>
      </Head>

      {/* Cargamos el script de A-Frame */}
      <Script src="https://aframe.io/releases/1.3.0/aframe.min.js" strategy="beforeInteractive" />

      {isClient ? (
        <a-scene vr-mode-ui="enabled: true" embedded style={{ position: 'relative', width: '100vw', height: '100vh' }}>
          {/* Cámara con controles de vista para PC, móviles y VR */}
          <a-entity position="0 1.6 0">
            <a-camera look-controls="enabled: true; touchEnabled: true; magicWindowTrackingEnabled: true" wasd-controls="enabled: false">
              <a-cursor
                raycaster="objects: .clickable"
                fuse="true"
                fuse-timeout="500"
                material="color: red; shader: flat"
                geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
              ></a-cursor>
            </a-camera>
          </a-entity>

          {/* Skybox con la imagen controlada por el estado */}
          <a-sky src={currentImage} rotation="0 0 0"></a-sky>

          {/* Botón interactivo para cambiar la escena */}
          <a-entity
            class="clickable"
            geometry="primitive: plane; width: 1; height: 0.5"
            material="color: #333"
            position="0 3.2 -2"
            text="value: Oficina; align: center; color: #FFF"
            event-set__mouseenter="material.color: #7BC8A4"
            event-set__mouseleave="material.color: #333"
            onclick={changeScene}
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
