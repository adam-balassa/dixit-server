import { Transactional } from '../model/interfaces';
import { QueryResult, QueryResultBase } from 'pg';

export interface Database extends Transactional {
	query(query: string, ...parameters: any): Promise<QueryResult>;
	run(query: string, ...parameters: any): Promise<QueryResultBase>;
}
