import { useEffect, useRef } from 'react';
import { StyleSheet, Image } from 'react-native';
import { Dimensions } from 'react-native';
import Canvas, { Image as CanvasImage } from 'react-native-canvas';
import { setNes } from './utils/useNes';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const imgSrc = require('./assets/static/bg_phone_1.png');

export default function App() {
  const canvasRef = useRef<Canvas>(null);
  
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    const ctx = canvas.getContext('2d');

    const img = new CanvasImage(canvas);
    const asset = Image.resolveAssetSource(imgSrc).uri;
    img.src = asset;
    img.addEventListener('load', () => {
      // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'green';
      ctx.fillRect(20, 20, 300, 300);
    });

    setNes(canvas);
  }, [canvasRef.current]);

  return <Canvas ref={canvasRef} style={styles.canvas} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
});
