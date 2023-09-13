import { importScript, importRom, disabledDoubleTouchScroll } from './utils.js';

const BASE_PHONE_WIDTH = 390;
const BASE_PHONE_HEIGHT = 844;
const RENDER_RATE = 3;
const PHONE_WIDTH = BASE_PHONE_WIDTH * RENDER_RATE;
const PHONE_HEIGHT = BASE_PHONE_HEIGHT * RENDER_RATE;
const PHONE_OFFSET_X = PHONE_WIDTH * 0.175;
const PHONE_OFFSET_Y = PHONE_HEIGHT * 0.076;

const NES_WIDTH = 256;
const NES_HEIGHT = 240;
const FRAMEBUFFER_SIZE = NES_WIDTH * NES_HEIGHT;
let nes;
let canvas, ctx;
let tempCanvas, tempCtx, tempImage;
let framebuffer_u8, framebuffer_u32;

if (!window.jsnes) {
	importScript('/packages/jsnes/dist/index.umd.js').then(async () => {
		await initCanvas();
		initNes();
		setButtons();
		disabledDoubleTouchScroll();
		setTimeout(() => {
			console.log('lnz loaded', );
			loadNes();
		}, 1000);
	});
}

const initCanvas = async () => {
	return new Promise((resolve, reject) => {
		canvas = document.getElementById('canvas');
		canvas.setAttribute('width', PHONE_WIDTH);
		canvas.setAttribute('height', PHONE_HEIGHT);
		ctx = canvas.getContext('2d');

		const img = new Image();
		img.src = './static/bg_phone_1.PNG';
		img.onload = function () {
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			ctx.fillStyle = 'green';
			ctx.fillRect(PHONE_OFFSET_X, PHONE_OFFSET_Y, NES_WIDTH * 2.84, NES_HEIGHT * 2.84);
			resolve();
		};
		img.onerror = function (e) {
			reject(e);
		};
	});
};

const initNes = () => {
	nes = new jsnes.NES({
		onFrame: function (framebuffer_24) {
			for (var i = 0; i < FRAMEBUFFER_SIZE; i++) framebuffer_u32[i] = 0xff000000 | framebuffer_24[i];
		},
	});

	// 临时canvas存放 256 * 240数据
	tempCanvas = document.createElement('canvas');
	tempCanvas.width = NES_WIDTH;
	tempCanvas.height = NES_HEIGHT;
	tempCtx = tempCanvas.getContext('2d');
	tempImage = tempCtx.getImageData(0, 0, NES_WIDTH, NES_HEIGHT);

	// Allocate framebuffer array.
	const buffer = new ArrayBuffer(tempImage.data.length);
	framebuffer_u8 = new Uint8ClampedArray(buffer);
	framebuffer_u32 = new Uint32Array(buffer);
};

const renderNes = () => {
	window.requestAnimationFrame(renderNes);
	nes.frame();
	tempImage.data.set(framebuffer_u8);

	// 将图像数据绘制到临时canvas上
	tempCtx.putImageData(tempImage, 0, 0);
	// 将临时canvas的内容放大并绘制到主canvas上
	ctx.drawImage(tempCanvas, PHONE_OFFSET_X, PHONE_OFFSET_Y, NES_WIDTH * 2.84, NES_HEIGHT * 2.84);
};

const loadNes = () => {
	nes.reset();
	importRom('../../../rom/hdl.nes').then((rom_data) => {
		nes.loadROM(rom_data);
		window.requestAnimationFrame(renderNes);
	});
};

const buttonMap = {
	start: { x: 306, y: 446, width: 80, height: 80 },
	select: { x: 16, y: 416, width: 36, height: 36 },
	left: { x: 12, y: 536, width: 48, height: 120 },
	right: { x: 92, y: 536, width: 48, height: 120 },
	up: { x: 18, y: 532, width: 120, height: 48 },
	down: { x: 18, y: 612, width: 120, height: 48 },
	x: { x: 268, y: 586, width: 48, height: 48 },
	y: { x: 222, y: 636, width: 48, height: 48 },
	a: { x: 312, y: 636, width: 48, height: 48 },
	b: { x: 268, y: 686, width: 48, height: 48 },
};
const setButtons = () => {
	// Object.keys(buttonMap).forEach((key) => {
	// 	const { x, y, width, height } = buttonMap[key];
	// 	ctx.fillStyle = 'blue';
	// 	ctx.fillRect(x * RENDER_RATE, y * RENDER_RATE, width * RENDER_RATE, height * RENDER_RATE);
	// });
	const renderRate = BASE_PHONE_WIDTH / canvas.getBoundingClientRect().width;
	const isButton = (btn, event) => {
		const x = ((event?.clientX || event?.changedTouches?.[0]?.pageX) - canvas.offsetLeft) * renderRate;
		const y = ((event?.clientY || event?.changedTouches?.[0]?.pageY) - canvas.offsetTop) * renderRate;
		return x > btn.x && x < btn.x + btn.width && y > btn.y && y < btn.y + btn.height;
	};
	const handleButtonDown = (event) => {
		if (isButton(buttonMap.start, event)) {
			nes.buttonDown(1, jsnes.Controller.BUTTON_START);
		}
		if (isButton(buttonMap.select, event)) {
			nes.buttonDown(1, jsnes.Controller.BUTTON_SELECT);
		}
		if (isButton(buttonMap.left, event)) {
			nes.buttonDown(1, jsnes.Controller.BUTTON_LEFT);
		}
		if (isButton(buttonMap.right, event)) {
			nes.buttonDown(1, jsnes.Controller.BUTTON_RIGHT);
		}
		if (isButton(buttonMap.up, event)) {
			nes.buttonDown(1, jsnes.Controller.BUTTON_UP);
		}
		if (isButton(buttonMap.down, event)) {
			nes.buttonDown(1, jsnes.Controller.BUTTON_DOWN);
		}
		if (isButton(buttonMap.a, event)) {
			nes.buttonDown(1, jsnes.Controller.BUTTON_A);
		}
		if (isButton(buttonMap.b, event)) {
			nes.buttonDown(1, jsnes.Controller.BUTTON_B);
		}
		if (isButton(buttonMap.x, event)) {
			nes.buttonDown(1, jsnes.Controller.BUTTON_A);
		}
		if (isButton(buttonMap.y, event)) {
			nes.buttonDown(1, jsnes.Controller.BUTTON_B);
		}
	};
	const handleButtonUp = (event) => {
		if (isButton(buttonMap.start, event)) {
			nes.buttonUp(1, jsnes.Controller.BUTTON_START);
		}
		if (isButton(buttonMap.select, event)) {
			nes.buttonUp(1, jsnes.Controller.BUTTON_SELECT);
		}
		if (isButton(buttonMap.left, event)) {
			nes.buttonUp(1, jsnes.Controller.BUTTON_LEFT);
		}
		if (isButton(buttonMap.right, event)) {
			nes.buttonUp(1, jsnes.Controller.BUTTON_RIGHT);
		}
		if (isButton(buttonMap.up, event)) {
			nes.buttonUp(1, jsnes.Controller.BUTTON_UP);
		}
		if (isButton(buttonMap.down, event)) {
			nes.buttonUp(1, jsnes.Controller.BUTTON_DOWN);
		}
		if (isButton(buttonMap.a, event)) {
			nes.buttonUp(1, jsnes.Controller.BUTTON_A);
		}
		if (isButton(buttonMap.b, event)) {
			nes.buttonUp(1, jsnes.Controller.BUTTON_B);
		}
		if (isButton(buttonMap.x, event)) {
			nes.buttonUp(1, jsnes.Controller.BUTTON_A);
		}
		if (isButton(buttonMap.y, event)) {
			nes.buttonUp(1, jsnes.Controller.BUTTON_B);
		}
	};
	canvas.addEventListener('mousedown', handleButtonDown);
	canvas.addEventListener('mouseup', handleButtonUp);
	canvas.addEventListener('touchstart', handleButtonDown);
	canvas.addEventListener('touchend', handleButtonUp);

	const handleKeyDown = (event) => {
		switch (event.keyCode) {
			case 87: // w
				nes.buttonDown(1, jsnes.Controller.BUTTON_UP);
				break;
			case 83: // s
				nes.buttonDown(1, jsnes.Controller.BUTTON_DOWN);
				break;
			case 65: // a
				nes.buttonDown(1, jsnes.Controller.BUTTON_LEFT);
				break;
			case 68: // d
				nes.buttonDown(1, jsnes.Controller.BUTTON_RIGHT);
				break;
			case 74: // j
				nes.buttonDown(1, jsnes.Controller.BUTTON_A);
				break;
			case 75: // k
				nes.buttonDown(1, jsnes.Controller.BUTTON_B);
				break;
			case 9: // tab
			case 16: // shift
				nes.buttonDown(1, jsnes.Controller.BUTTON_SELECT);
				break;
			case 75: // space
			case 13: // enter
				nes.buttonDown(1, jsnes.Controller.BUTTON_START);
				break;
			default:
				break;
		}
	};

	const handleKeyUp = (event) => {
		switch (event.keyCode) {
			case 87: // w
				nes.buttonUp(1, jsnes.Controller.BUTTON_UP);
				break;
			case 83: // s
				nes.buttonUp(1, jsnes.Controller.BUTTON_DOWN);
				break;
			case 65: // a
				nes.buttonUp(1, jsnes.Controller.BUTTON_LEFT);
				break;
			case 68: // d
				nes.buttonUp(1, jsnes.Controller.BUTTON_RIGHT);
				break;
			case 74: // j
				nes.buttonUp(1, jsnes.Controller.BUTTON_A);
				break;
			case 75: // k
				nes.buttonUp(1, jsnes.Controller.BUTTON_B);
				break;
			case 9: // tab
			case 16: // shift
				nes.buttonUp(1, jsnes.Controller.BUTTON_SELECT);
				break;
			case 75: // space
			case 13: // enter
				nes.buttonUp(1, jsnes.Controller.BUTTON_START);
				break;
			default:
				break;
		}
	};

	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);
};

// const curTable = [
//   0x525252, 0xb40000, 0xa00000, 0xb1003d, 0x740069, 0x00005b, 0x00005f, 0x001840, 0x002f10,
//   0x084a08, 0x006700, 0x124200, 0x6d2800, 0x000000, 0x000000, 0x000000, 0xc4d5e7, 0xff4000,
//   0xdc0e22, 0xff476b, 0xd7009f, 0x680ad7, 0x0019bc, 0x0054b1, 0x006a5b, 0x008c03, 0x00ab00,
//   0x2c8800, 0xa47200, 0x000000, 0x000000, 0x000000, 0xf8f8f8, 0xffab3c, 0xff7981, 0xff5bc5,
//   0xff48f2, 0xdf49ff, 0x476dff, 0x00b4f7, 0x00e0ff, 0x00e375, 0x03f42b, 0x78b82e, 0xe5e218,
//   0x787878, 0x000000, 0x000000, 0xffffff, 0xfff2be, 0xf8b8b8, 0xf8b8d8, 0xffb6ff, 0xffc3ff,
//   0xc7d1ff, 0x9adaff, 0x88edf8, 0x83ffdd, 0xb8f8b8, 0xf5f8ac, 0xffffb0, 0xf8d8f8, 0x000000,
//   0x000000,
// ];

// const curTableNew = [
//   0x464646, 0xe53224, 0xf56042, 0xf224b8, 0xdf00ff, 0x6820f0, 0x1c29d7, 0x3564b0, 0x0a7e8c,
//   0x04ac68, 0x2cdc5b, 0xd0b228, 0xcc7226, 0x272727, 0x000000, 0x000000, 0xa0b3e5, 0xff7b29,
//   0xff4d6e, 0xff69b4, 0xff00cc, 0xb041ff, 0x4e73ff, 0x40b2ff, 0x18dca0, 0x43ff3e, 0xffff82,
//   0xe0c242, 0xa0a0a0, 0x000000, 0x000000, 0xf2f2f2, 0xffc685, 0xff938d, 0xffaad4, 0xff81ff,
//   0xff99ff, 0x8eb1ff, 0x58cffe, 0x00fff6, 0x30ff96, 0xb0de3c, 0xd2d22d, 0xd8d8d8, 0x000000,
//   0x000000, 0xffffff, 0xfef4c0, 0xffd6c2, 0xfcd0ff, 0xffd6ff, 0xffd3ec, 0xd9c1ff, 0xa1c9ea,
//   0x7ce2ff, 0x7fffd4, 0xdcffdc, 0xfafff0, 0xfff6c8, 0xfbeff4, 0x000000, 0x000000,
// ];
// const hexColors = [...curTable, ...curTableNew].map((num) => {
//   let color = num.toString(16);
//   while (color.length < 6) {
//     color = '0' + color;
//   }
//   return '#' + color;
// });

// const canvas = document.getElementById('canvas');
// canvas.setAttribute('width', 400);
// canvas.setAttribute('height', 800);
// const ctx = canvas.getContext('2d');

// for (let i = 0; i < 8; i++) {
//   for (let j = 0; j < hexColors.length / 8; j++) {
//     const index = i * 8 + j;
//     ctx.fillStyle = hexColors[index];
//     ctx.beginPath();
//     ctx.fillRect(i * 50, j * 50, i * 50 + 50, j * 50 + 50);
//   }
// }
