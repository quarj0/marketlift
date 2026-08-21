import { graphqlRequest } from '@/lib/api-client';
import { mapCategory } from '@/lib/api-mappers';
import { CATEGORY_FIELDS } from '@/lib/graphql-fragments';
import type { CategoryConfiguration } from '@/types';

export const categoryService = {
  async getCategories() {
    const data = await graphqlRequest<{ categories: any[] }>(`query Categories { categories { ${CATEGORY_FIELDS} } }`);
    return data.categories.map(mapCategory);
  },

  async getConfiguration(categoryId: string): Promise<CategoryConfiguration | null> {
    const data = await graphqlRequest<{ category: any | null }>(
      `query Category($id: String!) { category(id: $id) { ${CATEGORY_FIELDS} } }`,
      { id: categoryId },
    );
    return data.category ? mapCategory(data.category) : null;
  },

  async getConfigurations(): Promise<CategoryConfiguration[]> {
    return this.getCategories();
  },
};
