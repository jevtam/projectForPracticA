export type OperationType = "income" | "expense";

export interface Operation {
  id: string;
  type: OperationType;
  amount: number;      //в рублях
  category: string;    //аренда, выручка, реклама и т.п.
  description?: string;
  date: string;        //YYYY-MM-DD (дата операции)
  createdAt: string;   //ISO-строка момента создания
}

export interface OperationInput {
  type: OperationType;
  amount: number;
  category: string;
  description?: string;
  date: string;        //YYYY-MM-DD
}
