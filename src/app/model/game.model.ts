export interface Member {
	id: string;
	name: string;
}

export interface Room {
	id: string;
	name: string;
	members: Member[];
}

export interface Card {
	id: number;
}

export interface Player extends Member {
	hand: Card[];
	choice?: Card;
	vote?: Card;
	score: number;
}

export interface Round {
	title?: string;
	number: number;
}

export interface Game extends Room {
	members: Player[];
	deck: Card[];
	round: Round;
}
