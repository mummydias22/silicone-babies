type Cat = { id: number; name: string; slug: string; parentId: number | null };

// Parents first, each followed by its children: [Newborn, Newborn › Boy, Newborn › Girl, Toddler, ...]
export function categoryTree<T extends Cat>(list: T[]) {
  const sorted = [...list].sort((a, b) => a.id - b.id);
  return sorted.filter((c) => !c.parentId).flatMap((p) => [
    { ...p, label: p.name, depth: 0 },
    ...sorted.filter((c) => c.parentId === p.id).map((c) => ({ ...c, label: `${p.name} › ${c.name}`, depth: 1 })),
  ]);
}

// A parent matches its own products and its children's; a subcategory matches only its own.
export const categoryIds = (list: Cat[], c: Cat) => [c.id, ...list.filter((x) => x.parentId === c.id).map((x) => x.id)];
