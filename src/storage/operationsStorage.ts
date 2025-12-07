import type { Operation, OperationInput } from "../types/operation";

const STORAGE_KEY = "biz-operations-v1";

function readOperations(): Operation[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch {
    return [];
  }
}

function saveOperations(list: Operation[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(16).slice(2);
}

export const operationsStorage = {
  getAll(): Operation[] {
    return readOperations();
  },

  add(input: OperationInput): Operation {
    const list = readOperations();
    const op: Operation = {
      id: createId(),
      createdAt: new Date().toISOString(),
      ...input,
    };
    list.push(op);
    saveOperations(list);
    return op;
  },

  update(id: string, input: OperationInput): Operation | null {
    const list = readOperations();
    const index = list.findIndex((o) => o.id === id);
    if (index === -1) return null;

    const updated: Operation = {
      ...list[index],
      ...input,
    };

    list[index] = updated;
    saveOperations(list);
    return updated;
  },

  delete(id: string): void {
    const list = readOperations().filter((o) => o.id !== id);
    saveOperations(list);
  },

  replaceAll(list: Operation[]) {
    saveOperations(list);
  },
};
