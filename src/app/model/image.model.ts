const base64Img = require('base64-img');
const appRoot = require('app-root-path');

class ImageReader {
	readImageInBase64(fileName: string): Promise<string> {
	  return new Promise((resolve, reject) => {
		const filePath = `${appRoot.path}/src/${fileName}`;
		base64Img.base64(filePath, (err: any, data: string) => {
		  if (err) return reject(err);
		  resolve(data);
		});
	  });
	}
}

export class DixitImage {
	static readonly numberOfImages: number = 161;

	path: string = '';
	constructor(index: number) {
		this.path = `assets/card_00${this.getPathEnding(index)}.jpg`;
	}

	getBase64(): Promise<string> {
		return new ImageReader().readImageInBase64(this.path);
	}

	private getPathEnding(index: number): string {
		const n = index + 1;
		return this.pad(n, 3);
	}

	private pad(num: number, len: number): string {
		return (Array(len).join('0') + num).slice(-len);
	}
}
