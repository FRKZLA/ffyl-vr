import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import fs from 'fs';
import path from 'path';

export async function getStaticProps() {
  // Cargar los archivos de texto
  const infoAPath = path.join(process.cwd(), 'public/data/InfoA.txt');
  const infoBPath = path.join(process.cwd(), 'public/data/InfoB.txt');
  const infoAContent = fs.readFileSync(infoAPath, 'utf8');
  const infoBContent = fs.readFileSync(infoBPath, 'utf8');

  return {
    props: {
      infoAContent,
      infoBContent
    }
  };
}

export default function Home({ infoAContent, infoBContent }) {
  const [isClient, setIsClient] = useState(false);
  const [isMobileOrVR, setIsMobileOrVR] = useState(false);
  const [currentImage, setCurrentImage] = useState('/data/InfoA.png');
  const [currentText, setCurrentText] = useState(infoAContent);

  useEffect(() => {
    setIsClient(true); // Esto asegura que el componente se renderice solo en el cliente

    // Detectar si es Oculus
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/Oculus/i.test(userAgent)) {
      setIsMobileOrVR(true);
    } else {
      setIsMobileOrVR(false);
    }

    // Añadir el evento de clic a los botones después de que A-Frame se cargue
    if (window.AFRAME) {
      const buttonA = document.querySelector('#buttonA');
      const buttonB = document.querySelector('#buttonB');

      if (buttonA) {
        buttonA.addEventListener('click', () => {
          setCurrentImage('/data/InfoA.png');
          setCurrentText(infoAContent);
        });
      }

      if (buttonB) {
        buttonB.addEventListener('click', () => {
          setCurrentImage('/data/InfoB.png');
          setCurrentText(infoBContent);
        });
      }
    }
  }, [infoAContent, infoBContent]);

  return (
    <div>
      <Head>
        <title>FFyL 360°</title>
        <meta name="description" content="FFyL 360°" />
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
          .a-enter-vr-button a-enter-ar-button{
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

      {/* Cargamos el script de A-Frame */}
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

          {/* Cargar las imágenes como assets */}
          <a-assets>
            <img id="infoA" src="/data/InfoA.png" crossorigin="anonymous" />
            <img id="infoB" src="/data/InfoB.png" crossorigin="anonymous" />
          </a-assets>

          {/* Skybox con la imagen actual */}
          <a-sky src="/image/Hallway.jpg" rotation="0 0 0"></a-sky>

          {/* Botones interactivos */}
          <a-entity id="ui" position="0 1.6 -2.5">
            {/* Botón para InfoA */}
            <a-entity id="buttonA" class="clickable" geometry="primitive: plane; width: 0.5; height: 0.5"
              material="color: Blue" position="-0.75 0 0" text="value: Info A; align: center; color: Red">
            </a-entity>

            {/* Botón para InfoB */}
            <a-entity id="buttonB" class="clickable" geometry="primitive: plane; width: 0.5; height: 0.5"
              material="color: Yellow" position="0.75 0 0" text="value: Info B; align: center; color: Green">
            </a-entity>
          </a-entity>

          {/* Panel de información para mostrar el texto correspondiente */}
          <a-entity id="infoPanel" position="0 0 -2" geometry="primitive: plane; width: 1.5; height: 1.0"
            material="color: #333" text={`value: ${currentText}; color: #FFF; wrapCount: 30;`}>
          </a-entity>

        </a-scene>
      ) : (
        <p>Cargando VR...</p>
      )}
    </div>
  );
}
