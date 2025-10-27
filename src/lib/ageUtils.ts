export function calcularEdadEnDias(fechaNacimiento: string | Date): number {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  const diferencia = hoy.getTime() - nacimiento.getTime();
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
}

export function calcularEdadEnSemanas(fechaNacimiento: string | Date): number {
  const dias = calcularEdadEnDias(fechaNacimiento);
  return Math.floor(dias / 7);
}

export function formatearEdad(fechaNacimiento: string | Date): string {
  const dias = calcularEdadEnDias(fechaNacimiento);
  const semanas = Math.floor(dias / 7);
  const diasRestantes = dias % 7;

  if (semanas === 0) {
    return `${dias} ${dias === 1 ? 'día' : 'días'}`;
  }

  if (diasRestantes === 0) {
    return `${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
  }

  return `${semanas} ${semanas === 1 ? 'semana' : 'semanas'} y ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}`;
}

export function calcularFechaNacimiento(fechaActual: string | Date, edadEnSemanas: number): Date {
  const fecha = new Date(fechaActual);
  const diasARestar = edadEnSemanas * 7;
  fecha.setDate(fecha.getDate() - diasARestar);
  return fecha;
}

export function debeAlertarPorEdad(fechaNacimiento: string | Date, diasObjetivo: number = 42): boolean {
  const dias = calcularEdadEnDias(fechaNacimiento);
  return dias >= diasObjetivo - 3;
}
