import type { Operation } from "../types/operation";
import * as XLSX from "xlsx";

export type Period = "day" | "week" | "month" | "all";

const TAX_RATE = 0.06;

function formatType(t: Operation["type"]) {
  return t === "income" ? "Доход" : "Расход";
}

function isInPeriod(d: Date, now: Date, period: Period): boolean {
  if (period === "all") return true;

  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (period === "day") return sameDay;

  if (period === "week") {
    const dayOfWeek = (now.getDay() + 6) % 7; //0 = Monday
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - dayOfWeek);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return d >= startOfWeek && d < endOfWeek;
  }

  if (period === "month") {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }

  return true;
}

function calcSummary(ops: Operation[]) {
  const income = ops
    .filter((o) => o.type === "income")
    .reduce((s, o) => s + o.amount, 0);

  const expense = ops
    .filter((o) => o.type === "expense")
    .reduce((s, o) => s + o.amount, 0);

  const profit = income - expense;
  const tax = income * TAX_RATE;

  return { income, expense, profit, tax };
}

function periodLabel(p: Period) {
  switch (p) {
    case "day":
      return "День";
    case "week":
      return "Неделя";
    case "month":
      return "Месяц";
    case "all":
      return "Всё время";
  }
}

export function exportOperationsToExcel(allOperations: Operation[], period: Period) {
  const now = new Date();

  const ops = allOperations
    .filter((op) => isInPeriod(new Date(op.date + "T00:00:00"), now, period))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const summary = calcSummary(ops);

  //лист 1: операции
  const rows = ops.map((op) => ({
    Дата: op.date,
    Тип: formatType(op.type),
    Категория: op.category,
    Сумма: op.amount,
    Комментарий: op.description ?? "",
  }));

  const wb = XLSX.utils.book_new();

  const wsOps = XLSX.utils.json_to_sheet(rows);
  wsOps["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 12 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsOps, "Операции");

  //лист 2: сводка
  const wsSummary = XLSX.utils.aoa_to_sheet([
    ["Период", periodLabel(period)],
    ["Дата выгрузки", now.toLocaleString("ru-RU")],
    [],
    ["Выручка", summary.income],
    ["Расходы", summary.expense],
    ["Чистая прибыль", summary.profit],
    ["Налоговая нагрузка (6% от выручки)", summary.tax],
    ["Количество операций", ops.length],
  ]);
  wsSummary["!cols"] = [{ wch: 36 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Сводка");

  //имя файла
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const filename = `финучет_${periodLabel(period)}_${y}-${m}-${d}.xlsx`;

  XLSX.writeFile(wb, filename);
}
