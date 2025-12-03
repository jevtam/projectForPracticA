import { useState } from "react";

type Tab = "dashboard" | "operations" | "payroll" | "settings";

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 flex flex-col min-h-screen">
        {/* Шапка */}
        <header className="py-4 border-b border-slate-800 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Сервис для малого бизнеса
            </h1>
            <p className="text-xs text-slate-400 mt-1">Core-модуль</p>
          </div>
          <div className="text-xs text-slate-400 mt-2 md:mt-0">
            Учет доходов, расходов и зарплат
          </div>
        </header>

        {/* Основной контент */}
        <main className="flex-1 py-6 md:py-10">
          {tab === "dashboard" && <Dashboard />}
          {tab === "operations" && <Operations />}
          {tab === "payroll" && <Payroll />}
          {tab === "settings" && <Settings />}
        </main>

        {/* Навигация */}
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
            <NavButton
              label="Зарплаты"
              active={tab === "payroll"}
              onClick={() => setTab("payroll")}
            />
            <NavButton
              label="Настройки"
              active={tab === "settings"}
              onClick={() => setTab("settings")}
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

function SectionDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-400 mt-1">{children}</p>;
}

function Dashboard() {
  return (
    <section className="space-y-4">
      <div>
        <SectionTitle>Дашборд</SectionTitle>
        <SectionDescription>
          Ключевые показатели: выручка, расходы, чистая прибыль, налоговая
          нагрузка и средняя прибыль на сотрудника.
        </SectionDescription>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Выручка за месяц" value="0 ₽" />
        <MetricCard label="Расходы за месяц" value="0 ₽" />
        <MetricCard label="Чистая прибыль" value="0 ₽" />
        <MetricCard label="Налоговая нагрузка" value="0 ₽" />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-400">
        Здесь позже добавим график выручки и расходов по времени.
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

function Operations() {
  return (
    <section className="space-y-3">
      <div>
        <SectionTitle>Учет доходов и расходов</SectionTitle>
        <SectionDescription>
          Ввод операций, категоризация (аренда, закупки, реклама и т.п.) и
          отчеты по дням, неделям и месяцам.
        </SectionDescription>
      </div>
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-400">
        Здесь скоро появится форма добавления операций и таблица.
      </div>
    </section>
  );
}

function Payroll() {
  return (
    <section className="space-y-3">
      <div>
        <SectionTitle>Зарплаты сотрудников</SectionTitle>
        <SectionDescription>
          Добавление сотрудников, ставки (почасовая/посменная), учет смен,
          бонусов и штрафов, автоматический расчет зарплаты.
        </SectionDescription>
      </div>
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-400">
        Здесь будет список сотрудников и смен.
      </div>
    </section>
  );
}

function Settings() {
  return (
    <section className="space-y-3">
      <div>
        <SectionTitle>Настройки</SectionTitle>
        <SectionDescription>
          Валюта, налоговая ставка, резервные копии данных и другие параметры.
        </SectionDescription>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
        Пока что здесь только описание. Позже добавим реальные настройки.
      </div>
    </section>
  );
}
