import { useState } from "react";
import type { Operation, OperationInput } from "./types/operation";
import { operationsStorage } from "./storage/operationsStorage";
import { exportOperationsToExcel } from "./utils/exportOperationsToExcel";

type Tab = "dashboard" | "operations";

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");

  //загрузка операции из localStorage
  const [operations, setOperations] = useState<Operation[]>(() =>
    operationsStorage.getAll()
  );

  //добавление новой операции
  const handleAddOperation = (input: OperationInput) => {
    const op = operationsStorage.add(input);
    setOperations((prev) => [...prev, op]);
  };
  //редактирование новой операции
  const handleUpdateOperation = (id: string, input: OperationInput) => {
    const updated = operationsStorage.update(id, input);
    if (!updated) return;
    setOperations((prev) => prev.map((o) => (o.id === id ? updated : o)));
  };
  //удаление новой операции
  const handleDeleteOperation = (id: string) => {
    operationsStorage.delete(id);
    setOperations((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 flex flex-col min-h-screen">
        {/*шапка*/}
        <header className="py-4 border-b border-slate-800 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Сервис для малого бизнеса
            </h1>
          </div>
        </header>

        {/*основной контент*/}
        <main className="flex-1 py-6 md:py-10">
          {tab === "dashboard" && <Dashboard operations={operations} />}
          {tab === "operations" && (
            <Operations
              operations={operations}
              onAddOperation={handleAddOperation}
              onUpdateOperation={handleUpdateOperation}
              onDeleteOperation={handleDeleteOperation}
            />
          )}
        </main>

        {/*навигация*/}
        <nav className="border-t border-slate-800 pb-3 pt-2">
          <div className="flex text-xs md:text-sm">
            <NavButton
              label="Дашборд"
              active={tab === "dashboard"}
              onClick={() => setTab("dashboard")}
            />
            <NavButton
              label="Операции"
              active={tab === "operations"}
              onClick={() => setTab("operations")}
            />
          </div>
        </nav>
      </div>
    </div>
  );
}

function NavButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex-1 py-2 border-r border-slate-800 last:border-r-0 transition " +
        (active
          ? "bg-slate-800 text-slate-50 font-medium"
          : "bg-slate-900 text-slate-400 hover:bg-slate-800/60")
      }
    >
      {label}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}

//ДАШБОРД
type Period = "day" | "week" | "month" | "all";

const TAX_RATE = 0.06; //условная ставка налога 6% от выручки (например, УСН)

function Dashboard({ operations }: { operations: Operation[] }) {
  const [period, setPeriod] = useState<Period>("month");

  const metrics = calculateMetrics(operations, period);
  const tax = Math.max(metrics.income, 0) * TAX_RATE;
  const chartData = buildChartData(operations, period);

  const chartMax = chartData.length
    ? Math.max(...chartData.map((p) => Math.max(p.income, p.expense)), 1)
    : 1;
  const maxBarHeight = 140; // пиксели

  return (
    <section className="space-y-4">
      {/*заголовок и выбор периода*/}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <SectionTitle>Дашборд</SectionTitle>
        </div>
        <div className="flex flex-wrap gap-2 text-xs items-center">
          <PeriodButton
            label="День"
            active={period === "day"}
            onClick={() => setPeriod("day")}
          />
          <PeriodButton
            label="Неделя"
            active={period === "week"}
            onClick={() => setPeriod("week")}
          />
          <PeriodButton
            label="Месяц"
            active={period === "month"}
            onClick={() => setPeriod("month")}
          />
          <PeriodButton
            label="Всё время"
            active={period === "all"}
            onClick={() => setPeriod("all")}
          />

          <button
            type="button"
            disabled={operations.length === 0}
            onClick={() => exportOperationsToExcel(operations, period)}
            className={
              "ml-0 md:ml-2 px-3 py-2 rounded-md text-sm font-medium transition " +
              (operations.length === 0
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-white")
            }
          >
            Выгрузить в Excel
          </button>
        </div>
      </div>

      {/*карточки метрик*/}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Выручка" value={formatMoney(metrics.income)} />
        <MetricCard label="Расходы" value={formatMoney(metrics.expense)} />
        <MetricCard
          label="Чистая прибыль"
          value={formatMoney(metrics.profit)}
        />
        <MetricCard label="Налоговая нагрузка" value={formatMoney(tax)} />
      </div>

      {/*график по дням*/}
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-slate-100">
            График выручки и расходов по дням
          </div>
          <div className="flex gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-1 rounded-full bg-emerald-400" />{" "}
              Доходы
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-1 rounded-full bg-rose-400" />{" "}
              Расходы
            </span>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="text-sm text-slate-400">
            За выбранный период нет операций.
          </div>
        ) : (
          <div className="mt-3 h-40 flex items-end gap-2 overflow-x-auto pb-2">
            {chartData.map((point) => {
              const incomeHeight =
                chartMax > 0 ? (point.income / chartMax) * maxBarHeight : 0;
              const expenseHeight =
                chartMax > 0 ? (point.expense / chartMax) * maxBarHeight : 0;

              return (
                <div
                  key={point.date}
                  className="flex flex-col items-center gap-1 min-w-[48px]"
                >
                  {/*столбики дохода и расхода с общей базой*/}
                  <div className="w-full flex-1 flex items-end gap-1">
                    <div
                      className="flex-1 bg-emerald-400/80 rounded-t-md"
                      style={{ height: `${incomeHeight}px` }}
                      title={`Доход: ${formatMoney(point.income)}`}
                    />
                    <div
                      className="flex-1 bg-rose-400/80 rounded-t-md"
                      style={{ height: `${expenseHeight}px` }}
                      title={`Расход: ${formatMoney(point.expense)}`}
                    />
                  </div>
                  {/*подпись даты*/}
                  <div className="text-[10px] text-slate-400 text-center leading-tight">
                    {point.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function PeriodButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-2 py-1 rounded-md border text-xs " +
        (active
          ? "bg-slate-800 border-slate-500 text-slate-50"
          : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800/60")
      }
    >
      {label}
    </button>
  );
}

//ОПЕРАЦИИ
interface OperationsProps {
  operations: Operation[];
  onAddOperation: (input: OperationInput) => void;
  onUpdateOperation: (id: string, input: OperationInput) => void;
  onDeleteOperation: (id: string) => void;
}

function Operations({
  operations,
  onAddOperation,
  onUpdateOperation,
  onDeleteOperation,
}: OperationsProps) {
  const today = new Date();
  const defaultDate = toInputDate(today);

  const [form, setForm] = useState<{
    type: "income" | "expense";
    amount: string;
    category: string;
    description: string;
    date: string;
  }>({
    type: "income",
    amount: "",
    category: "",
    description: "",
    date: defaultDate,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNumber = Number(form.amount);
    if (!form.category.trim() || !form.date || isNaN(amountNumber)) {
      return;
    }

    const payload: OperationInput = {
      type: form.type,
      amount: amountNumber,
      category: form.category.trim(),
      description: form.description.trim() || undefined,
      date: form.date,
    };

    if (editingId) {
      onUpdateOperation(editingId, payload);
    } else {
      onAddOperation(payload);
    }

    setForm((prev) => ({
      ...prev,
      amount: "",
      description: "",
    }));
    setEditingId(null);
  };

  const totalIncome = operations
    .filter((o) => o.type === "income")
    .reduce((sum, o) => sum + o.amount, 0);
  const totalExpense = operations
    .filter((o) => o.type === "expense")
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle>Учет доходов и расходов</SectionTitle>
      </div>

      {/*форма*/}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-slate-300 mb-1">
              Тип операции
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              <option value="income">Доход</option>
              <option value="expense">Расход</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs text-slate-300 mb-1">Сумма</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              placeholder="0"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs text-slate-300 mb-1">Дата</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-slate-300 mb-1">
              Категория
            </label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              placeholder="Например: аренда, выручка, реклама"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1">
            Комментарий (необязательно)
          </label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            placeholder="Например: оплата аренды за декабрь"
          />
        </div>

        <div className="flex justify-end gap-2">
          {editingId && (
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-slate-600 text-sm text-slate-200 hover:bg-slate-800/60"
              onClick={() => {
                setEditingId(null);
                setForm((prev) => ({
                  ...prev,
                  amount: "",
                  description: "",
                  category: "",
                  type: "income",
                  date: defaultDate,
                }));
              }}
            >
              Отмена
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white"
          >
            {editingId ? "Сохранить изменения" : "Добавить операцию"}
          </button>
        </div>
      </form>

      {/*сводка*/}
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Всего доходов" value={formatMoney(totalIncome)} />
        <MetricCard label="Всего расходов" value={formatMoney(totalExpense)} />
        <MetricCard
          label="Итог за все время"
          value={formatMoney(totalIncome - totalExpense)}
        />
      </div>

      {/*таблица операций*/}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-800 text-xs text-slate-400">
          Последние операции ({operations.length})
        </div>
        {operations.length === 0 ? (
          <div className="px-4 py-3 text-sm text-slate-400">
            Операций пока нет. Добавьте первую через форму выше.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto text-sm">
            <table className="w-full border-collapse">
              <thead className="bg-slate-900 text-xs text-slate-400 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 font-normal">Дата</th>
                  <th className="text-left px-4 py-2 font-normal">Тип</th>
                  <th className="text-left px-4 py-2 font-normal">Категория</th>
                  <th className="text-left px-4 py-2 font-normal">Сумма</th>
                  <th className="text-left px-4 py-2 font-normal">
                    Комментарий
                  </th>
                  <th className="text-left px-4 py-2 font-normal">Действия</th>
                </tr>
              </thead>
              <tbody>
                {operations
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((op) => (
                    <tr
                      key={op.id}
                      className="border-t border-slate-800 hover:bg-slate-900/60"
                    >
                      <td className="px-4 py-2">{formatDate(op.date)}</td>
                      <td className="px-4 py-2">
                        <span
                          className={
                            "px-2 py-0.5 rounded-full text-xs " +
                            (op.type === "income"
                              ? "bg-emerald-900 text-emerald-200"
                              : "bg-rose-900 text-rose-200")
                          }
                        >
                          {op.type === "income" ? "Доход" : "Расход"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-100">
                        {op.category}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={
                            op.type === "income"
                              ? "text-emerald-300"
                              : "text-rose-300"
                          }
                        >
                          {formatMoney(op.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-400">
                        {op.description || "-"}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <button
                          type="button"
                          className="mr-2 text-sky-400 hover:text-sky-300"
                          onClick={() => {
                            setEditingId(op.id);
                            setForm({
                              type: op.type,
                              amount: String(op.amount),
                              category: op.category,
                              description: op.description ?? "",
                              date: op.date,
                            });
                          }}
                        >
                          Редакт.
                        </button>
                        <button
                          type="button"
                          className="text-rose-400 hover:text-rose-300"
                          onClick={() => {
                            if (window.confirm("Удалить операцию?")) {
                              onDeleteOperation(op.id);
                            }
                          }}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function formatMoney(value: number): string {
  return (
    value.toLocaleString("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }) + " ₽"
  );
}

function toInputDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("ru-RU");
}

function calculateMetrics(operations: Operation[], period: Period) {
  const now = new Date();
  const filtered = operations.filter((op) => {
    const d = new Date(op.date + "T00:00:00");
    return isInPeriod(d, now, period);
  });

  const income = filtered
    .filter((o) => o.type === "income")
    .reduce((sum, o) => sum + o.amount, 0);
  const expense = filtered
    .filter((o) => o.type === "expense")
    .reduce((sum, o) => sum + o.amount, 0);

  return {
    income,
    expense,
    profit: income - expense,
    count: filtered.length,
  };
}

interface ChartPoint {
  date: string; //YYYY-MM-DD
  label: string; //подпись под столбиком
  income: number;
  expense: number;
}

function buildChartData(operations: Operation[], period: Period): ChartPoint[] {
  const now = new Date();
  const byDate = new Map<string, { income: number; expense: number }>();

  for (const op of operations) {
    const d = new Date(op.date + "T00:00:00");
    if (!isInPeriod(d, now, period)) continue;

    const key = op.date;
    const bucket = byDate.get(key) || { income: 0, expense: 0 };

    if (op.type === "income") {
      bucket.income += op.amount;
    } else {
      bucket.expense += op.amount;
    }

    byDate.set(key, bucket);
  }

  const entries = Array.from(byDate.entries()).sort(
    ([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime()
  );

  return entries.map(([date, value]) => {
    const d = new Date(date + "T00:00:00");
    const label = d.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
    });

    return {
      date,
      label,
      income: value.income,
      expense: value.expense,
    };
  });
}

function isInPeriod(d: Date, now: Date, period: Period): boolean {
  if (period === "all") return true;

  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (period === "day") return sameDay;

  //неделя, понедельник–воскресенье текущей недели
  if (period === "week") {
    const dayOfWeek = (now.getDay() + 6) % 7; //0 = Monday
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - dayOfWeek);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return d >= startOfWeek && d < endOfWeek;
  }

  //текущий календарный месяц
  if (period === "month") {
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  }

  return true;
}
