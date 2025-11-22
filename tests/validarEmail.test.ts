function validarEmail(email: string): boolean {
  if (!email) return false;
  // simple, widely-used email validation: something@something.something (no spaces)
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

test('valida emails correctos', () => {
  expect(validarEmail('usuario@dominio.com')).toBe(true);
  expect(validarEmail('nombre.apellido+alias@sub.dominio.co')).toBe(true);
});

test('rechaza emails inválidos', () => {
  expect(validarEmail('sin-arroba.com')).toBe(false);
  expect(validarEmail('usuario@')).toBe(false);
  expect(validarEmail('')).toBe(false);
});