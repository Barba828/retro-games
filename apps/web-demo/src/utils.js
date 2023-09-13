export const importScript = (url) => {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = url;

		// 当脚本加载完成时，解析Promise
		script.addEventListener('load', () => {
			resolve();
		});

		// 如果脚本加载失败，拒绝Promise
		script.addEventListener('error', () => {
			reject(new Error(`Failed to load script at ${url}`));
		});

		document.body.appendChild(script);
	});
};

export const importRom = async (path) => {
	return new Promise((resolve, reject) => {
		const req = new XMLHttpRequest();
		req.open('GET', path);
		req.overrideMimeType('text/plain; charset=x-user-defined');
		req.onerror = () => {
			console.log(`Error loading ${path}: ${req.statusText}`);
			reject();
		};
		req.onload = function () {
			if (this.status === 200) {
				console.log('lnz loaded', this.responseText);
				resolve(this.responseText);
			} else if (this.status === 0) {
				// Aborted, so ignore error
			} else {
				req.onerror();
			}
		};

		req.send();
	});
};

export const disabledDoubleTouchScroll = () => {
	let agent = navigator.userAgent.toLowerCase();
	let iLastTouchTime = null;
	if (agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0) {
		document.querySelector('body').addEventListener(
			'touchend',
			function (event) {
				let iNowTime = new Date().getTime();
				iLastTouchTime = iLastTouchTime || iNowTime + 1;
				let delta = iNowTime - iLastTouchTime;
				if (delta < 500 && delta > 0) {
					event.preventDefault();
					return false;
				}
				iLastTouchTime = iNowTime;
			},
			false
		);
	}
};
