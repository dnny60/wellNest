import React, { useRef } from 'react';
import { View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei/native';

function Animal(props) {
  const ref = useRef();
  const { nodes, materials } = useGLTF('path/to/your/animal.glb');

  useFrame((state, delta) => {
    ref.current.rotation.y += delta;
  });

  return (
    <group ref={ref} {...props}>
      <primitive object={nodes.Scene} />
    </group>
  );
}

export default function AnimalScene() {
  return (
    <View style={{ flex: 1 }}>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Animal position={[0, 0, 0]} />
      </Canvas>
    </View>
  );
}