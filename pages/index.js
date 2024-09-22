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
  const [currentArea, setCurrentArea] = useState('area1'); // Área inicial
  const [currentPanel, setCurrentPanel] = useState(null); // Panel inicial

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
    if (window.AFRAME && !AFRAME.components['area-button-handler']) {
      AFRAME.registerComponent('area-button-handler', {
        init: function () {
          const el = this.el;
          el.addEventListener('click', () => {
            const areaId = el.getAttribute('id'); // Identifica el área
            setCurrentArea(areaId); // Cambia el área actual
            setCurrentPanel(null); // Resetea el panel cuando cambias de área
          });
        }
      });
    }

    if (window.AFRAME && !AFRAME.components['panel-button-handler']) {
      AFRAME.registerComponent('panel-button-handler', {
        init: function () {
          const el = this.el;
          el.addEventListener('click', () => {
            setCurrentPanel(infoData.areas[currentArea]); // Cargar la información del panel actual
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
          .a-enter-vr-button{
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
          .a-enter-ar-button{
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
                material="color: red; shader: flat"
                geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
              ></a-cursor>
            </a-camera>
          </a-entity>

          {/* Skybox con la imagen del área actual */}
          <a-sky src={infoData.areas[currentArea].image} rotation="0 0 0"></a-sky>

          {/* Botones interactivos para cambiar de área */}
          <a-entity id="areaButtons" position="0 1.6 -2.5">
            <a-entity id="area1" class="clickable area-button" geometry="primitive: plane; width: 0.5; height: 0.5"
              material="color: Blue" position="-0.75 0 0" text="value: Área 1; align: center; color: Red"
              area-button-handler>
            </a-entity>

            <a-entity id="area2" class="clickable area-button" geometry="primitive: plane; width: 0.5; height: 0.5"
              material="color: Yellow" position="0.75 0 0" text="value: Área 2; align: center; color: Green"
              area-button-handler>
            </a-entity>
          </a-entity>

          {/* Botones interactivos para mostrar el panel de información */}
          <a-entity id="panelButtons" position="0 1.6 -1.5">
            <a-entity id="panel1" class="clickable panel-button" geometry="primitive: plane; width: 0.5; height: 0.5"
              material="color: Red" position="-0.5 0 0" text="value: Ver Panel; align: center; color: White"
              panel-button-handler>
            </a-entity>
          </a-entity>

          {/* Panel de información si existe */}
          {currentPanel && (
            <>
              <a-entity id="infoPanel" position="0 2.5 -1" geometry="primitive: plane; width: 1.5; height: 1.0"
                material="color: #333" text={`value: ${currentPanel.description}; color: #FFF; wrapCount: 30;`}>
              </a-entity>

              {currentPanel.hasPanelImage && (
                <a-entity id="imagePanel" position="0 1 -1.5" geometry="primitive: plane; width: 1.5; height: 1.0"
                  material={`src: ${currentPanel.panelImage}; color: #FFF`}>
                </a-entity>
              )}
            </>
          )}
        </a-scene>
      ) : (
        <p>Cargando VR...</p>
      )}
    </div>
  );
}
