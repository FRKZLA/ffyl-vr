import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import fs from 'fs';
import path from 'path';

export async function getStaticProps() {
  // Cargar el archivo JSON con la información
  const infoPath = path.join(process.cwd(), 'public/data/info.json');
  const infoContent = fs.readFileSync(infoPath, 'utf8');
  const infoData = JSON.parse(infoContent);

  return {
    props: {
      infoData
    }
  };
}

export default function Home({ infoData }) {
  const [isClient, setIsClient] = useState(false);
  const [isMobileOrVR, setIsMobileOrVR] = useState(false);
  const [currentArea, setCurrentArea] = useState('hallway'); // Área inicial
  const [currentPanel, setCurrentPanel] = useState(null); // Panel inicial
  const [fuseActive, setFuseActive] = useState(false); // Estado para controlar el fuse

  useEffect(() => {
    setIsClient(true); // Asegura que el componente se renderice solo en el cliente

    // Detectar si es Oculus
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/Oculus/i.test(userAgent)) {
      setIsMobileOrVR(true);
    } else {
      setIsMobileOrVR(false);
    }

    // Verificar si los componentes ya están registrados antes de registrarlos
    if (window.AFRAME && !AFRAME.components['button-handler']) {
      AFRAME.registerComponent('button-handler', {
        schema: {
          area: { type: 'string' }, // Recibe el área o información
          type: { type: 'string' }, // Puede ser "area" o "info"
        },
        init: function () {
          const el = this.el;
          const data = this.data;
          let timeout; // Variable para el retardo
          
          // Animación de interacción
          el.addEventListener('mouseenter', () => {
            setFuseActive(true); // Activa la animación del cursor
            el.setAttribute('material', 'opacity', 1); // Resalta el botón
            timeout = setTimeout(() => {
              if (data.type === 'area') {
                setCurrentArea(data.area); // Cambia de área
                setCurrentPanel(null); // Cierra el panel
              } else if (data.type === 'info') {
                setCurrentPanel(infoData.info[data.area]); // Muestra el panel de información
              }
            }, 500); // Retardo de medio segundo
          });

          el.addEventListener('mouseleave', () => {
            clearTimeout(timeout); // Cancelar la acción si el cursor sale del área
            setFuseActive(false); // Detiene la animación del cursor
            el.setAttribute('material', 'opacity', 0.5); // Restaura el estado normal del botón
          });
        }
      });
    }
  }, [currentArea, infoData]);

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
          .a-enter-ar-button {
            visibility: hidden !important;
          }
        `}</style>
      </Head>

      {/* Cargar el script de A-Frame */}
      <Script src="https://aframe.io/releases/1.3.0/aframe.min.js" strategy="beforeInteractive" />

      {isClient ? (
        <a-scene vr-mode-ui="enabled: true" embedded style={{ position: 'relative', width: '100vw', height: '100vh' }}>
          <a-entity position="0 1.6 0">
            <a-camera look-controls="enabled: true; touchEnabled: true; magicWindowTrackingEnabled: true" wasd-controls="enabled: false">
              <a-cursor
                raycaster="objects: .clickable"
                fuse="true"                    // Activar fuse (clic después de mantener el puntero sobre el objeto)
                fuse-timeout="1500"            // Tiempo que tarda en activarse (1500ms)
                material="color: white; shader: flat"
                geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
                animation__scale="property: scale; to: 2 2 2; easing: easeInOutQuad; dur: 3000; startEvents: fuse-start"
                animation__scale_reverse="property: scale; to: 1 1 1; easing: easeInOutQuad; dur: 3000; startEvents: fuse-end"
              ></a-cursor>
            </a-camera>
          </a-entity>

          {/* Skybox con la imagen del área actual */}
          <a-sky src={infoData.area[currentArea].image} rotation="0 0 0"></a-sky>

          {/* Botones interactivos para cambiar de área */}
          <a-entity id="areaButtons" position="0 1.6 -2.5">
            {Object.keys(infoData.area).map((key, index) => (
              <a-entity key={key} class="clickable" 
                id={key}
                button-handler={`area: ${key}; type: area`}
                geometry="primitive: plane; width: 0.5; height: 0.3"
                material="color: black; opacity: 0.5"
                position={`${index * 1.5} 0 0`}
                text={`value: ${infoData.area[key].description}; align: center; color: white; font: mozillavr;`}>
              </a-entity>
            ))}
          </a-entity>

          {/* Botones interactivos para mostrar información */}
          <a-entity id="infoButtons" position="0 3.5 -2.5">
            {Object.keys(infoData.info).map((key, index) => (
              <a-entity key={key} class="clickable" 
                id={key}
                button-handler={`area: ${key}; type: info`}
                geometry="primitive: plane; width: 0.5; height: 0.3"
                material="color: black; opacity: 0.5"
                position={`${index * 1.5} 0 0`}
                text={`value: ${infoData.info[key].description}; align: center; color: white; font: mozillavr;`}>
              </a-entity>
            ))}
          </a-entity>

          {/* Panel de información si existe */}
          {currentPanel && (
            <a-entity id="infoPanel" position="0 2 -2" geometry="primitive: plane; width: 3.0; height: 1.5;"
              material="color: #333; opacity: 0.5" text={`value: ${currentPanel.description}; color: white; wrapCount: 30;`}>
              {currentPanel.panelImage && (
                <a-entity id="panelImage" position="1 0 0.1" geometry="primitive: plane; width: 1.0; height: 1.0"
                  material={`src: ${currentPanel.panelImage}; color: white`}>
                </a-entity>
              )}
            </a-entity>
          )}
        </a-scene>
      ) : (
        <p>Cargando VR...</p>
      )}
    </div>
  );
}
