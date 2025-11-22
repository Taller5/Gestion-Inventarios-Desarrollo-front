async function obtenerProductos() {
  const res = await fetch('/api/productos');
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

beforeEach(() => {
  (global as any).fetch = jest.fn();
});

test('devuelve lista de productos desde la API', async () => {
  const mockData = [{ id: '1', nombre: 'Producto A' }];
  (global as any).fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockData
  });

  const res = await obtenerProductos();
  expect(res).toEqual(mockData);
  expect((global as any).fetch).toHaveBeenCalled();
});

test('lanza error cuando la respuesta no es ok', async () => {
  (global as any).fetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'ERR' });
  await expect(obtenerProductos()).rejects.toThrow();
});