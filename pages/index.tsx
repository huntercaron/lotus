import Head from "next/head";
import * as React from "react";
import { useMemo, useRef, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import { data } from "../lib/data";

const count = 15625;
const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();
const colors = new Array(count).fill("").map(() => "#ffffff");

function InnerRects() {
  const colorArray = useMemo(
    () =>
      Float32Array.from(
        new Array(count)
          .fill("")
          .flatMap((_, i) => tempColor.set(colors[i]).toArray())
      ),
    []
  );

  const ref = useRef<THREE.InstancedMesh>();
  const { invalidate } = useThree();

  useEffect(() => {
    const rawBlockData = data;

    const blockData = {};
    for (let [key, value] of Object.entries(rawBlockData)) {
      blockData[key] = JSON.parse(value as any);
    }

    let i = 0;
    for (let z = 0; z < 25; z++)
      for (let y = 0; y < 25; y++)
        for (let x = 0; x < 25; x++) {
          const id = i++;
          const zNum = x + y * 26;
          if (blockData[`z${z}`]) {
            if (blockData[`z${z}`].hasOwnProperty(zNum)) {
              if (blockData[`z${z}`][zNum] === "#ffffff") {
                tempObject.scale.set(0, 0, 0);
              } else {
                tempObject.scale.set(1, 1, 1);
              }
              tempObject.position.set(-x, y, -z);

              tempColor
                .set(blockData[`z${z}`][zNum])
                .toArray(colorArray, id * 3);

              tempObject.updateMatrix();
              ref.current.setMatrixAt(id, tempObject.matrix);

              // @ts-ignore
              ref.current.geometry.attributes.color.needsUpdate = true;
            } else {
              tempObject.scale.set(0, 0, 0);
              tempObject.updateMatrix();
              ref.current.setMatrixAt(id, tempObject.matrix);
            }
          }
        }
    ref.current.instanceMatrix.needsUpdate = true;
    invalidate();
  }, []);

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <boxBufferGeometry attach="geometry" args={[1.0, 1.0, 1.0]}>
        <instancedBufferAttribute
          attachObject={["attributes", "color"]}
          args={[colorArray, 3]}
        />
      </boxBufferGeometry>
      <meshBasicMaterial
        attach="material"
        // @ts-ignore
        vertexColors={THREE.VertexColors}
      />
    </instancedMesh>
  );
}

function InnerScene() {
  const mesh = useRef<THREE.Object3D>();
  useFrame(() => (mesh.current.rotation.y += 0.01));

  return (
    <group ref={mesh}>
      <group
        rotation={[0, 0, -Math.PI]}
        scale={[0.5, 0.5, 0.5]}
        position={[-6.25, 6.25, 6.25]}
      >
        <InnerRects />
      </group>
    </group>
  );
}

export default function Rects() {
  return (
    <>
      <Head>
        <title>sheet</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Canvas
        style={{
          height: "100%",
          width: "100%",
          position: "fixed",
        }}
        dpr={[1, 1.5]}
        linear
        colorManagement={false}
        gl={{ antialias: false, alpha: false }}
        camera={{
          position: [0, 0, 25],
          near: 5,
          far: 150,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping;
          gl.setClearColor("white");
        }}
      >
        <InnerScene />
        <ambientLight intensity={2} />
        <pointLight position={[150, 150, 150]} intensity={1} />
        {/* @ts-ignore */}
        <OrbitControls />
      </Canvas>
      <p
        style={{
          background: "black",
          borderRadius: "50px",
          position: "absolute",
          padding: "5px 12px 8px",
          bottom: 15,
          left: 15,
          margin: 0,
          fontSize: "24px",
          textAlign: "center",
          color: "white",
          height: "auto",
        }}
        onClick={() =>
          alert(
            "The experiment is now over, thank you to everyone who participated! The current blocks will remain here as an archive."
          )
        }
      >
        open sheet
      </p>
    </>
  );
}
