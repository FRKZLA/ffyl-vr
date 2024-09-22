import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [isMobileOrVR, setIsMobileOrVR] = useState(false);

  useEffect(() => {
    setIsClient(true); // Esto asegura que el componente se renderice solo en el cliente

    // Detectar si es Oculus
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/Oculus/i.test(userAgent)) {
      setIsMobileOrVR(true);
    } else {
      setIsMobileOrVR(false);
    }
  }, []);

  // Función para redirigir a la página de la oficina
  const redirectToOffice = () => {
    window.location.href = '/office';
  };

  return (
    <div>
      <Head>
        <title>FFyL 360°</title>
        <meta name="description" content="FFyL 360°" />
        {/* Agregar estilos */}
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            height: 100%;
          }
          #__next {
            height: 100%;
          }
          .a-enter-vr-button {
            position: fixed !important;
            bottom: 25px !important;
            right: 25px !important;
            z-index: 9999 !important;
            visibility: ${isMobileOrVR ? 'visible' : 'hidden'} !important;
            width: 105px !important;
            height: 70px !important;
            background-color: rgba(0, 0, 0, 0.5) !important;
            color: white !important;
            border: none !important;
            font-size: 14px !important;
            border-radius: 10px !important;
          }
        `}</style>
      </Head>

      <Script src="https://aframe.io/releases/1.3.0/aframe.min.js" strategy="beforeInteractive" />

      {isClient ? (
        <a-scene vr-mode-ui="enabled: true" embedded style={{ position: 'relative', width: '100vw', height: '100vh' }}>
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

          {/* Skybox con la imagen del pasillo */}
          <a-sky src="/image/Hallway.jpg" rotation="0 0 0"></a-sky>

          {/* Botón para navegar a la página de la Oficina */}
          <a-entity
            class="clickable"
            geometry="primitive: plane; width: 1.5; height: 0.7" 
            material="color: #333"
            position="0 1.5 -3"  
            text="value: Oficina; align: center; color: #FFF"
            event-set__mouseenter="material.color: #7BC8A4"
            event-set__mouseleave="material.color: #333"
            event-set__click="material.color: #00FF00"
            onclick={redirectToOffice}  // Usamos window.location.href para redirigir
          ></a-entity>

        </a-scene>
      ) : (
        <p>Cargando VR...</p>
      )}
    </div>
  );
}
