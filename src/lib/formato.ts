/** 1234.5 → "$ 1.234,50" */
export function formatMonto(n: number): string {
  const [enteros, decimales] = Math.abs(n).toFixed(2).split('.');
  const conMiles = enteros.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${n < 0 ? '-' : ''}$ ${conMiles},${decimales}`;
}

/**
 * Acepta "1500", "1500,5" o "1500.50" (el teclado decimal usa coma o punto según el idioma del
 * teléfono). Sin separador de miles. Devuelve null si no es un monto válido con hasta 2 decimales.
 */
export function parseMonto(texto: string): number | null {
  const limpio = texto.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) {
    return null;
  }
  const valor = Number(limpio);
  return valor > 0 ? valor : null;
}

/** 1500.5 → "1500,50" para precargar un campo de monto. */
export function montoParaInput(n: number): string {
  return n.toFixed(2).replace('.', ',');
}

export function formatFecha(iso: string): string {
  const d = new Date(iso);
  const dosDigitos = (x: number) => String(x).padStart(2, '0');
  return `${dosDigitos(d.getDate())}/${dosDigitos(d.getMonth() + 1)}/${d.getFullYear()} ${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}`;
}
