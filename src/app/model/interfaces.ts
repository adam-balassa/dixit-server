export interface Transactional {
	close(): void;
	beginTransaction(): Promise<any>;
}
