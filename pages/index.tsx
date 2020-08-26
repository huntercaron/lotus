import Head from "next/head"
import * as React from "react"
import { useMemo, useRef, useEffect } from "react"
import { Canvas, useThree } from "react-three-fiber"
import { OrbitControls } from "drei"
import * as THREE from "three"
import * as firebase from "firebase/app"
import "firebase/database"

const sheetPathBase = "16KxukCtLcg1mDfR3S4joQVreji31t5s-QMFN_-HplF0/"
const firebaseConfig = {
    apiKey: "AIzaSyCwN6ks-now1sWq4LgsMFXEc7-ZG8g0gJY",
    authDomain: "sheet-9537c.firebaseapp.com",
    databaseURL: "https://sheet-9537c.firebaseio.com",
    projectId: "sheet-9537c",
    storageBucket: "sheet-9537c.appspot.com",
    messagingSenderId: "930956368841",
    appId: "1:930956368841:web:1f235a078f938f27fca618",
}

const count = 15625
const tempObject = new THREE.Object3D()
const tempColor = new THREE.Color()
const colors = new Array(count).fill("").map(() => "#ffffff")

function InnerRects() {
    const colorArray = useMemo(
        () =>
            Float32Array.from(
                new Array(count)
                    .fill("")
                    .flatMap((_, i) => tempColor.set(colors[i]).toArray())
            ),
        []
    )

    const ref = useRef<THREE.InstancedMesh>()
    const fbApp = useRef(null)
    const database = useRef<any>()
    const { invalidate } = useThree()

    useEffect(() => {
        const app = fbApp.current ?? firebase.initializeApp(firebaseConfig)
        fbApp.current = app
        database.current = app.database()

        database.current.ref(sheetPathBase).on("value", (snapshot) => {
            const rawBlockData = snapshot.val()
            const blockData = {}
            for (let [key, value] of Object.entries(rawBlockData)) {
                blockData[key] = JSON.parse(value as any)
            }

            let i = 0
            for (let z = 0; z < 25; z++)
                for (let y = 0; y < 25; y++)
                    for (let x = 0; x < 25; x++) {
                        const id = i++
                        const zNum = x + y * 26
                        if (blockData[`z${z}`]) {
                            if (blockData[`z${z}`].hasOwnProperty(zNum)) {
                                if (blockData[`z${z}`][zNum] === "#ffffff") {
                                    tempObject.scale.set(0, 0, 0)
                                } else {
                                    tempObject.scale.set(1, 1, 1)
                                }
                                tempObject.position.set(-x, y, -z)

                                tempColor
                                    .set(blockData[`z${z}`][zNum])
                                    .toArray(colorArray, id * 3)

                                tempObject.updateMatrix()
                                ref.current.setMatrixAt(id, tempObject.matrix)

                                // @ts-ignore
                                ref.current.geometry.attributes.color.needsUpdate = true
                            } else {
                                tempObject.scale.set(0, 0, 0)
                                tempObject.updateMatrix()
                                ref.current.setMatrixAt(id, tempObject.matrix)
                            }
                        }
                    }
            ref.current.instanceMatrix.needsUpdate = true
            invalidate()
        })
    }, [])

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
    )
}

export default function Rects() {
    // const randomRotation = useMemo(() => Math.random() * Math.PI, [])

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
                invalidateFrameloop
                gl={{ antialias: false, alpha: false }}
                camera={{
                    position: [0, 0, 25],
                    near: 5,
                    far: 150,
                }}
                onCreated={({ gl }) => gl.setClearColor("white")}
            >
                <ambientLight />
                <pointLight position={[150, 150, 150]} intensity={0.55} />

                <group
                    rotation={[0, 0, -Math.PI]}
                    scale={[0.5, 0.5, 0.5]}
                    position={[-6.25, 6.25, 3.25]}
                >
                    <InnerRects />
                </group>

                <OrbitControls />
            </Canvas>
            <a
                style={{
                    background: "black",
                    borderRadius: "50px",
                    position: "absolute",
                    padding: "5px 12px 8px",
                    bottom: 15,
                    left: 15,
                    fontSize: "24px",
                    textAlign: "center",
                    color: "white",
                    height: "auto",
                }}
                target="_blank"
                rel="noreferrer"
                href="https://docs.google.com/spreadsheets/d/16KxukCtLcg1mDfR3S4joQVreji31t5s-QMFN_-HplF0/edit"
            >
                open sheet
            </a>
        </>
    )
}
