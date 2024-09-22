import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script'; // Importamos Script de Next.js

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [currentImage, setCurrentImage] = useState('/image/Hallway.jpg'); // Estado para controlar la imagen

  useEffect(() => {
    setIsClient(true);
    console.log("A-Frame initialized"); // Verificar que A-Frame se está cargando
  }, []);

  // Función para cambiar la imagen a Office.jpg
  const changeScene = () => {
    setCurrentImage('/image/Office.jpg');
    console.log("Image changed to Office.jpg"); // Verificar que la función changeScene funciona
  };

  // Imprimir el estado de la imagen actual
  console.log("Current image:", currentImage);

  return (
    <div>
      <Head>
        <title>360° Image Viewer</title>
        <meta name="description" content="360° Image Viewer - A-Frame" />
      </Head>

      {/* Cargamos el script de A-Frame */}
      <Script src="https://aframe.io/releases/1.3.0/aframe.min.js" strategy="beforeInteractive" />

      {isClient ? (
        <>
          {/* Verificamos si a-scene está siendo renderizado */}
          <p>Rendering A-Frame scene...</p>

          <a-scene embedded vr-mode-ui="enabled: true" cursor="rayOrigin: mouse">
            {/* Cámara y cursor para VR */}
            <a-entity position="0 1.6 0">
              <a-camera>
                <a-cursor></a-cursor>
              </a-camera>
            </a-entity>

            {/* Skybox con la imagen controlada por el estado */}
            <a-sky src={currentImage} rotation="0 0 0"></a-sky>

            {/* Elemento de prueba: Cubo */}
            <a-box position="0 1 -3" rotation="0 45 0" color="#4CC3D9" depth="1" height="1" width="1"></a-box>

            {/* Botón interactivo para cambiar la escena */}
            <a-entity 
              geometry="primitive: plane; width: 2; height: 0.8"
              material="color: #333" // Color oscuro para mejor visibilidad
              position="0 1.5 -3" 
              rotation="0 0 0"
              text="value: Oficina; align: center"
              event-set__mouseenter="material.color: #7BC8A4"  // Cambiar color al centrar
              event-set__mouseleave="material.color: #333"  // Cambiar de nuevo al salir
              onclick={changeScene}  // Cambia la escena cuando se hace clic
            ></a-entity>

            {/* Agregar luces para mejorar la visibilidad */}
            <a-light type="ambient" color="#ffffff"></a-light>
            <a-light type="directional" position="-1 1 0" intensity="1"></a-light>
          </a-scene>
        </>
      ) : (
        <p>Cargando VR...</p> // Mensaje mientras se renderiza en el cliente
      )}
    </div>
  );
}
