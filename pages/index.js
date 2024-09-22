import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script'; // Importamos Script de Next.js

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [currentImage, setCurrentImage] = useState('/image/Hallway.jpg'); // Estado para controlar la imagen

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
      <Script src="https://aframe.io/releases/1.2.0/aframe.min.js" strategy="beforeInteractive" />

      {isClient ? (
        <a-scene embedded vr-mode-ui="enabled: true" cursor="rayOrigin: mouse">
          {/* Habilitar controles y modo inmersivo */}
          <a-entity position="0 1.6 0">
            {/* Cursor para interacción en VR */}
            <a-camera>
              <a-cursor></a-cursor>
            </a-camera>
          </a-entity>

          {/* Skybox con la imagen controlada por el estado */}
          <a-sky src={currentImage} rotation="0 0 0"></a-sky>

          {/* Botón interactivo para cambiar la escena */}
          <a-entity 
            geometry="primitive: plane; width: 2; height: 0.8"
            material="color: #FFC65D"
            position="0 1.5 -3" 
            rotation="0 0 0"
            text="value: Oficina; align: center"
            event-set__mouseenter="material.color: #7BC8A4"  // Cambiar color al centrar
            event-set__mouseleave="material.color: #FFC65D"  // Cambiar de nuevo al salir
            class="clickable"
            onclick={changeScene}  // Cambia la escena cuando se hace clic
          ></a-entity>
        </a-scene>
      ) : (
        <p>Cargando VR...</p> // Mensaje mientras se renderiza en el cliente
      )}
    </div>
  );
}
