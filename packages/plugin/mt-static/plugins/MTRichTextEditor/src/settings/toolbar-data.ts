export type ToolbarData = string[][][][];

const normalizeToolbarGroup = (data: unknown): string[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  const ids = new Set<string>();
  return data.filter((id): id is string => {
    if (typeof id !== "string" || id.length === 0 || ids.has(id)) {
      return false;
    }
    ids.add(id);
    return true;
  });
};

export const normalizeToolbarData = (data: unknown): ToolbarData => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.flatMap((row) => {
    if (!Array.isArray(row)) {
      return [];
    }

    const normalizedRow = row.slice(0, 2).map((side) => {
      if (!Array.isArray(side)) {
        return [];
      }

      return side.flatMap((group) => {
        const normalizedGroup = normalizeToolbarGroup(group);
        return normalizedGroup.length > 0 ? [normalizedGroup] : [];
      });
    });

    return normalizedRow.some((side) => side.length > 0) ? [normalizedRow] : [];
  });
};

export const parseToolbarData = (value: string): ToolbarData => {
  try {
    return normalizeToolbarData(JSON.parse(value));
  } catch {
    return [];
  }
};

export const serializeToolbarData = (data: unknown): string => {
  return JSON.stringify(normalizeToolbarData(data));
};

export const parseToolbarItemIds = (value: string): string[] => {
  try {
    return normalizeToolbarGroup(JSON.parse(value));
  } catch {
    return [];
  }
};
