import { Database } from '../database/database';

export class DataLayer {
  private database: Database;

  public constructor(transaction: boolean = false) {
    this.database = new Database();
  }

  private close() {
    this.database.close();
  }

  public inTransaction<T>(method: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.database.beginTransaction().then(() => {
        return method();
      }).then<T>(result => {
        return result;
      }).finally(() => {
        this.database.close();
        console.log('connection closed');
      });
    });
  }
}
