import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import fs from 'fs';
import path from 'path';

export async function getStaticProps() {
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
  const [currentArea, setCurrentArea] = useState('hallwayA'); // Área inicial
  const [areRot, setareRot] = useState('0 0 0'); // Orientación inicial
  const [currentPanel, setCurrentPanel] = useState(null); // Panel inicial
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0, z: -2 }); // Posición del panel
  const [fuseActive, setFuseActive] = useState(false); // Estado para controlar el fuse
  const [inspectorMode, setInspectorMode] = useState(false); // Modo inspector (panel abierto)

  useEffect(() => {
    setIsClient(true);

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    setIsMobileOrVR(/Oculus/i.test(userAgent));

    // Registrar los componentes solo si no están registrados
    if (window.AFRAME && !AFRAME.components['button-handler']) {
      AFRAME.registerComponent('button-handler', {
        schema: {
          area: { type: 'string' }, // Recibe el área o información
          type: { type: 'string' } // Puede ser "area", "info" o "close"
        },
        init: function () {
          const el = this.el;
          const data = this.data;
          let timeout;

          el.addEventListener('mouseenter', () => {
            if (!inspectorMode) { // Solo permite la interacción si no estamos en modo inspector
              setFuseActive(true);
              el.setAttribute('material', 'opacity', 1);
              timeout = setTimeout(() => {
                if (data.type === 'area') {
                  setCurrentArea(data.area);
                  setCurrentPanel(null);
                } else if (data.type === 'info') {
                  setCurrentPanel(infoData.info[data.area]);
                  setPanelPosition(el.object3D.position);
                  setInspectorMode(true); // Activa modo inspector cuando se abre un panel
                  disableAllButtons();
                } else if (data.type === 'close') {
                  setCurrentPanel(null);
                  setInspectorMode(false); // Desactiva el modo inspector al cerrar el panel
                  enableAllButtons();
                }
              }, 500);
            }
          });

          el.addEventListener('mouseleave', () => {
            clearTimeout(timeout);
            setFuseActive(false);
            el.setAttribute('material', 'opacity', 0.5);
          });
        }
      });
    }

    if (window.AFRAME && !AFRAME.components['face-camera']) {
      AFRAME.registerComponent('face-camera', {
        tick: function () {
          const camera = document.querySelector('[camera]');
          if (camera) {
            const cameraPosition = camera.object3D.position;
            this.el.object3D.lookAt(cameraPosition);
          }
        }
      });
    }
  }, [currentArea, infoData, inspectorMode]);

  const disableAllButtons = () => {
    const buttons = document.querySelectorAll('.clickable');
    buttons.forEach(button => {
      button.setAttribute('visible', 'false');
      button.classList.remove('clickable'); // Elimina la clase clickable para deshabilitar el raycaster
    });
  };

  const enableAllButtons = () => {
    // Se restaura correctamente la clase clickable y la visibilidad de los botones
    const areaButtons = document.getElementById('areaButtons');
    const infoButtons = document.getElementById('infoButtons');

    if (areaButtons) {
      const areaChildren = areaButtons.children;
      Array.from(areaChildren).forEach(button => {
        button.setAttribute('visible', 'true');
        button.classList.add('clickable');
      });
    }

    if (infoButtons) {
      const infoChildren = infoButtons.children;
      Array.from(infoChildren).forEach(button => {
        button.setAttribute('visible', 'true');
        button.classList.add('clickable');
      });
    }
  };

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

      <Script src="https://aframe.io/releases/1.3.0/aframe.min.js" strategy="beforeInteractive" />

      {isClient ? (
        <a-scene vr-mode-ui="enabled: true" embedded style={{ position: 'relative', width: '100vw', height: '100vh' }}>
          <a-entity position="0 0 0">
            <a-camera look-controls="enabled: true; touchEnabled: true; magicWindowTrackingEnabled: true" wasd-controls="enabled: false">
              <a-cursor
                raycaster="objects: .clickable"
                fuse="true"
                fuse-timeout="1500"
                material="color: white; shader: flat"
                geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
                animation__scale="property: scale; to: 2 2 2; easing: easeInOutQuad; dur: 300; startEvents: fuse-start"
                animation__scale_reverse="property: scale; to: 1 1 1; easing: easeInOutQuad; dur: 300; startEvents: fuse-end"
              ></a-cursor>
            </a-camera>
          </a-entity>

          {/* Skybox con la imagen del área actual */}
          <a-sky src={infoData.area[currentArea].image} rotation={infoData.area[currentArea].areRot}></a-sky>

          {/* Botones distribuidos manualmente */}
          <a-entity id="areaButtons" raycaster="objects: .clickable">
            <a-entity id="hallwayA" class="clickable"
              button-handler={`area: hallwayA; type: area`}
              geometry="primitive: plane; width: 0.5; height: 0.3"
              scale="2 2 2"
              material="color: black; opacity: 0.5"
              position="-0.5 1.6 3"
              text="value: Hallway; align: center; color: white; width: 2"
              face-camera>
            </a-entity>

            <a-entity id="office" class="clickable"
              button-handler={`area: office; type: area`}
              geometry="primitive: plane; width: 0.5; height: 0.3"
              scale="2 2 2"
              material="color: black; opacity: 0.5"
              position="0.5 1.6 -2"
              text="value: Office; align: center; color: white; width: 2"
              face-camera>
            </a-entity>
          </a-entity>

          <a-entity id="infoButtons" raycaster="objects: .clickable">
            <a-entity id="punto1" class="clickable"
              button-handler={`area: punto 1; type: info`}
              geometry="primitive: plane; width: 0.5; height: 0.3"
              scale="2 2 2"
              material="color: black; opacity: 0.5"
              position="-2 1.0 0"
              text="value: info; align: center; color: white; width: 2"
              face-camera>
            </a-entity>

            <a-entity id="pinturaA" class="clickable"
              button-handler={`area: pintura A; type: info`}
              geometry="primitive: plane; width: 0.5; height: 0.3"
              scale="2 2 2"
              material="color: black; opacity: 0.5"
              position="2 2.0 0.2"
              text="value: Pintura A; align: center; color: white; width: 2"
              face-camera>
            </a-entity>
          </a-entity>

          {/* Panel de información con la posición dinámica */}
          {currentPanel && (
            <a-entity id="infoPanel" position={`${panelPosition.x} ${panelPosition.y} ${panelPosition.z}`}
              geometry={`primitive: plane; width: ${currentPanel.panWidth}; height: ${currentPanel.panHeight};`}
              material="color: #333; opacity: 0.5"
              text={`value: ${currentPanel.description}; color: white; align: left; anchor: center; wrapCount: 30; width: 1.5; xOffset: -.2; zOffset: 0.005;`}
              face-camera>
              
              {currentPanel.panelImage && (
                <a-entity id="panelImage" position="1.5 0 0.1" geometry="primitive: plane; width: 1.0; height: 1.0"
                  material={`src: ${currentPanel.panelImage}; color: white`}>
                </a-entity>
              )}

              {/* Botón de cerrar en la esquina superior derecha */}
              <a-entity id="closeButton" geometry="primitive: circle; width: 0.5; height: 0.5"
                material="color: red; opacity: 0.8"
                scale=".1 .1 .1"
                position={`-1 ${currentPanel.cloPos} 0.01`}
                text="value: X; color: white; align: center; width: 25; zOffset: 0.005;"
                class="clickable"
                button-handler={`area: close; type: close`}>
              </a-entity>
            </a-entity>
          )}
        </a-scene>
      ) : (
        <p>Cargando VR...</p>
      )}
    </div>
  );
}
