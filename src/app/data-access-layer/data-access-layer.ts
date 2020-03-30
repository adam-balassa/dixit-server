import { Game } from '../model/game.model';
import { Database, FileDatabase } from '../database/simple-db';

export class DataAccessLayer {
	db: Database;
	constructor() {
		this.db = new FileDatabase();
	}

	saveData(game: Game): Promise<void> {
		return this.db.saveData(game.id, JSON.stringify(game));
	}

	getData(id: string): Promise<Game> {
		return new Promise(async (resolve, reject) => {
			try {
				const gameStr = await this.db.getData(id);
				resolve(JSON.parse(gameStr) as Game);
			} catch (error) {
				reject(error);
			}
		});
	}

	exists(id: string): boolean {
		return this.db.doesFileExist(id);
	}
}
