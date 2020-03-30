const appRoot = require('app-root-path');
import { readFile, writeFile, existsSync } from 'fs';

export interface Database {
	getData(identifier: string): Promise<string>;
	saveData(identifier: string, data: string): Promise<void>;
	doesFileExist(identifier: string): boolean;
}

export class FileDatabase implements Database{
	readonly root: string = `${appRoot.path}/src/assets/data`;
	getData(identifier: string): Promise<string> {
		return this.readFile(this.root + `/${identifier}.data`);
	}

	saveData(identifier: string, data: string) {
		return this.writeFile(this.root + `/${identifier}.data`, data);
	}

	doesFileExist(identifier: string): boolean {
		return existsSync(this.root + `/${identifier}.data`);
	}

	private readFile(path: string): Promise<string>  {
		return new Promise((resolve, reject) => {
			readFile(path, (err, data) => {
				if (err) reject('Invalid path');
				else resolve(data.toString());
			});
		});
	}

	private writeFile(path: string, data: string): Promise<void>  {
		return new Promise((resolve, reject) => {
			writeFile(path, data, (err) => {
				if (err) reject('Invalid path');
				else resolve();
			});
		});
	}
}
