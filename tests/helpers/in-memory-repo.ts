export function createInMemoryRepo<T extends { id: string }>(initial: T[] = []) {
  const data = new Map<string, T>(initial.map((d) => [d.id, { ...d }]));

  return {
    async create(item: T) {
      if (data.has(item.id)) throw new Error('Conflict: already exists');
      data.set(item.id, { ...item });
      return { ...item };
    },

    async findById(id: string) {
      return data.get(id) ?? null;
    },

    async findAll() {
      return Array.from(data.values()).map((d) => ({ ...d }));
    },

    async update(id: string, patch: Partial<T>) {
      const existing = data.get(id);
      if (!existing) throw new Error('NotFound');
      const updated = { ...existing, ...patch } as T;
      data.set(id, updated);
      return { ...updated };
    },

    async delete(id: string) {
      return data.delete(id);
    },

    // Helpers for tests
    __inspect() {
      return Array.from(data.values()).map((d) => ({ ...d }));
    },
  };
}
