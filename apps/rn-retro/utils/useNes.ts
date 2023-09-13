import jsnes from './jsnes';
import Canvas from 'react-native-canvas';
import { TextDecoder } from 'text-encoding';

const NES_WIDTH = 256;
const NES_HEIGHT = 240;
const FRAMEBUFFER_SIZE = NES_WIDTH * NES_HEIGHT;

export const setNes = async (canvas: Canvas) => {
  let animationFrameId: number;

  const ctx = canvas.getContext('2d');
  const image = await ctx.getImageData(0, 0, NES_WIDTH, NES_HEIGHT);
  const tempBuffer = new ArrayBuffer(image.data.length);
  const framebuffer_u8 = new Uint8ClampedArray(tempBuffer);
  const framebuffer_u32 = new Uint32Array(tempBuffer);
  const nes = new jsnes.NES({
    onFrame: (framebuffer_24: any[]) => {
      for (var i = 0; i < FRAMEBUFFER_SIZE; i++)
        framebuffer_u32[i] = 0xff000000 | framebuffer_24[i];
    },
  });

  const draw = () => {
    nes.frame();
    // image.data.set(framebuffer_u8);
    for (let i = 0; i < framebuffer_u8.length; i++) {
      image.data[i] = framebuffer_u8[i];
    }
    ctx.putImageData(image, 0, 0);
    animationFrameId = requestAnimationFrame(draw);
    // console.log('lnz animationFrameId', animationFrameId);
  };

  const rom = await importRom('http://172.26.201.131:5501/rom/hdl.nes');
  nes.loadROM(rom);

  draw()
};

const importRom = async (path: string) => {
  const response = await fetch(path);
  const contentLength = response.headers.get('Content-Length');
  console.log('importRom size', contentLength);

  const arrayBuffer = await response.arrayBuffer();
  const decoder = new TextDecoder();
  const romText = decoder.decode(arrayBuffer);

  return romText;
};
