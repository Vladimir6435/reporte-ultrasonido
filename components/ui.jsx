"use client";

// ============================================================
//  Componentes de interfaz reutilizables
//  Diseñados para "solo escoger, marcar o completar".
// ============================================================

export function Section({ title, subtitle, children, accent }) {
  return (
    <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {title && (
        <div className="mb-4 border-b border-gray-100 pb-3">
          <h3 className={`text-lg font-semibold ${accent ? "text-brand-700" : "text-gray-800"}`}>
            {title}
          </h3>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children, className = "" }) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      )}
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function TextField({ value, onChange, placeholder, type = "text", suffix }) {
  return (
    <div className="flex items-stretch">
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
      />
      {suffix && (
        <span className="ml-2 flex items-center text-sm text-gray-500">{suffix}</span>
      )}
    </div>
  );
}

export function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
    />
  );
}

/** Botones tipo "segmented control" — escoger una opción. */
export function Segmented({ value, onChange, options, size = "md" }) {
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`${pad} rounded-md font-medium transition ${
              active
                ? "bg-brand-600 text-white shadow"
                : "text-gray-600 hover:bg-white"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Sí / No simple. */
export function YesNo({ value, onChange }) {
  return (
    <Segmented
      value={value}
      onChange={onChange}
      options={[
        { value: "si", label: "Sí" },
        { value: "no", label: "No" },
      ]}
    />
  );
}

export function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
      />
      {label}
    </label>
  );
}

/** Campo numérico con etiqueta de unidad y opción "no hay medición". */
export function Measurement({
  label,
  value,
  onChange,
  unit,
  noMeasure,
  onNoMeasure,
  placeholder,
  inputType = "number",
  width = "220px",
  noMeasureLabel = "No hay medición",
}) {
  return (
    <Field label={label}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-stretch" style={{ maxWidth: width }}>
          <input
            type={inputType}
            step={inputType === "number" ? "any" : undefined}
            disabled={noMeasure}
            value={noMeasure ? "" : value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-gray-100"
          />
          {unit && (
            <span className="ml-2 flex items-center whitespace-nowrap text-sm text-gray-500">
              {unit}
            </span>
          )}
        </div>
        {onNoMeasure && (
          <Checkbox checked={noMeasure} onChange={onNoMeasure} label={noMeasureLabel} />
        )}
      </div>
    </Field>
  );
}

export function Button({ children, onClick, variant = "primary", disabled, className = "" }) {
  const styles = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "bg-white text-brand-700 border border-brand-600 hover:bg-brand-50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    dark: "bg-gray-800 text-white hover:bg-gray-900",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Grid({ children, cols = 2 }) {
  const c = { 1: "grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3" }[cols];
  return <div className={`grid grid-cols-1 gap-x-6 ${c}`}>{children}</div>;
}
