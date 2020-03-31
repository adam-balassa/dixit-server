import { DataAccessLayer } from '../data-access-layer/data-access-layer';
import { Success, ServerError, RequestError, Error } from '../router/request.model';
import { shuffle } from 'seededshuffle';
import { Game, Card, Player } from '../model/game.model';
import { DixitImage } from '../model/image.model';

export class Controller {
	dal: DataAccessLayer;

	constructor() {
		this.dal = new DataAccessLayer();
	}

	createNewRoom(name: string): Promise<Success<Game>> {
		const game: Game = {
			id: this.generateId(),
			members: [],
			deck: this.generateDeck(DixitImage.numberOfImages),
			name,
			round: { number: 0 }
		};
		return this.dal.saveData(game)
		.then(() => new Success(game));
	}

	joinRoom(roomId: string, name: string): Promise<Success<Game>> {
		return new Promise(async(resolve, reject) => {
			try {
				const game: Game = await this.dal.getData(roomId);
				game.members.push({ name, hand: [], id: this.generateId(), score: 0 });
				await this.dal.saveData(game);
				resolve(new Success(game));
			} catch (error) {
				if (error instanceof Error)
					reject(error);
				else reject(new ServerError(error.message || 'Something went wrong'));
			}
		});
	}

	startGame(roomId: string): Promise<Success> {
		return new Promise(async(resolve, reject) => {
			try {
				const game: Game = await this.dal.getData(roomId);
				if (game.members.some(m => m.hand.length > 0)) throw new RequestError('Game is already started!');
				for (let i = 0; i < 6; i++)
					this.drawCard(game);
				await this.dal.saveData(game);
				resolve(new Success(game));
			} catch (error) {
				if (error instanceof Error)
					reject(error);
				else reject(new ServerError(error.message || 'Something went wrong'));
			}
		});
	}

	startNewRound(roomId: string): Promise<Success<Game>> {
		return new Promise(async(resolve, reject) => {
			try {
				const game: Game = await this.dal.getData(roomId);
				if (game.members.some(m => !m.vote))
					throw new RequestError('Previous round must be finished!');
				this.setScores(game);
				game.members.forEach(member => {
					const choiceIndex = member.hand.findIndex(card => card.id === member.choice?.id);
					member.hand.splice(choiceIndex, 1);
				});
				this.drawCard(game);
				game.members.forEach(member => {
					member.choice = undefined;
					member.vote = undefined;
				});
				game.round.number++;
				game.round.title = undefined;
				await this.dal.saveData(game);
				resolve(new Success(game));
			} catch (error) {
				if (error instanceof Error)
					reject(error);
				else reject(new ServerError(error.message || 'Something went wrong'));
			}
		});
	}

	getGame(roomId: string): Promise<Success<Game>> {
		return new Promise(async(resolve, reject) => {
			try {
				const game: Game = await this.dal.getData(roomId);
				resolve(new Success(game));
			} catch (error) {
				if (error instanceof Error)
					reject(error);
				else reject(new ServerError(error.message || 'Something went wrong'));
			}
		});
	}

	addRoundTitle(roomId: string, title: string, card: number): Promise<Success<Game>> {
		return new Promise(async(resolve, reject) => {
			try {
				const game: Game = await this.dal.getData(roomId);
				game.round.title = title;
				const playerIndex = game.round.number % game.members.length;
				const player = game.members[playerIndex];
				console.log(player.name);
				if (!player.hand.some(c => c.id === card)) throw new RequestError('Player cant choose this card!');
				player.choice = { id: card };
				await this.dal.saveData(game);
				resolve(new Success(game));
			} catch (error) {
				if (error instanceof Error)
					reject(error);
				else reject(new ServerError(error.message || 'Something went wrong'));
			}
		});
	}

	addChoice(roomId: string, choice: number, playerId: string): Promise<Success<Game>> {
		return new Promise(async(resolve, reject) => {
			try {
				const game: Game = await this.dal.getData(roomId);
				if (!game.round.title) throw new RequestError('Title has not been chosen');
				const player: Player | undefined = game.members.find(m => m.id === playerId);
				if (player === undefined) throw new RequestError('Invalid playerId');
				if (player.choice) throw new RequestError('Player has already chosen');
				if (!player.hand.some(c => c.id === choice)) throw new RequestError('Player cant choose this card!');
				player.choice = { id: choice };
				await this.dal.saveData(game);
				resolve(new Success(game));
			} catch (error) {
				if (error instanceof Error)
					reject(error);
				else reject(new ServerError(error.message || 'Something went wrong'));
			}
		});
	}

	addVote(roomId: string, vote: number, playerId: string): Promise<Success<Game>> {
		return new Promise(async(resolve, reject) => {
			try {
				const game: Game = await this.dal.getData(roomId);
				if (game.members.some(m => !m.choice))
					throw new RequestError('Everybody must choose a card');
				const player: Player | undefined = game.members.find(m => m.id === playerId);
				if (player === undefined) throw new RequestError('Invalid playerId');
				if (player.vote) throw new RequestError('Player has already voted');
				if (game.members.every(m => m.choice?.id !== vote)) throw new RequestError('Player cant choose this card!');
				player.vote = { id: vote };
				await this.dal.saveData(game);
				resolve(new Success(game));
			} catch (error) {
				if (error instanceof Error)
					reject(error);
				else reject(new ServerError(error.message || 'Something went wrong'));
			}
		});
	}

	private generateDeck(length: number): Card[] {
		const numbers = Array.from(new Array(length).keys());
		const arr = this.shuffle(numbers);
		return arr.map<Card>(number => ({ id: number + 1 }));
	}

	private setScores(game: Game) {
		const playerIndex = game.round.number % game.members.length;
		const player = game.members[playerIndex];
		const correctAnswer: Card = player.choice!;

		if (game.members.every(m => m.vote?.id === correctAnswer.id || m.id === player.id))
			game.members.forEach(m => {
				if (m.id !== player.id) m.score += 2;
			});
		else if (game.members.every(m => m.vote?.id !== correctAnswer.id || m.id === player.id))
			game.members.forEach(m => {
				if (m.id !== player.id) m.score += 2;
			});
		else {
			player.score += 3;
			game.members.forEach(m => {
				if (m.vote?.id === correctAnswer.id)
					m.score += 3;
				else {
					const votedPlayer = game.members.find(member => member.choice?.id === m.vote?.id)!
					votedPlayer.score++;
				}
			});
		}
	}

	private generateId(): string {
		return 'xxx-x4x-xx'.replace(/[xy]/g, function (c) {
			// tslint:disable-next-line: no-bitwise
			const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	private shuffle(a: any[]) {
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	private drawCard(game: Game) {
		game.members.forEach(member => {
			member.hand.push(game.deck.splice(0, 1)[0]);
		});
	}
}
