import { graphqlRequest } from '@/lib/api-client';
import { mapCategory, type ApiCategory } from '@/lib/api-mappers';
import { CATEGORY_FIELDS } from '@/lib/graphql-fragments';
import type { CategoryConfiguration } from '@/types';

const LEGACY_ROOT_CATEGORY_IDS = new Set([
  "properties",
  "land",
  "home",
  "agriculture",
  "business",
  "other",
]);

function publicCategories(categories: ReturnType<typeof mapCategory>[]) {
  return categories.filter(
    (category) =>
      category.active !== false &&
      !LEGACY_ROOT_CATEGORY_IDS.has(category.id.trim().toLowerCase()),
  );
}

export const categoryService = {
  async getCategories() {
    const data = await graphqlRequest<{ categories: ApiCategory[] }>(`query Categories { categories { ${CATEGORY_FIELDS} } }`);
    return publicCategories(data.categories.map(mapCategory));
  },

  async getConfiguration(categoryId: string): Promise<CategoryConfiguration | null> {
    const data = await graphqlRequest<{ category: ApiCategory | null }>(
      `query Category($id: String!) { category(id: $id) { ${CATEGORY_FIELDS} } }`,
      { id: categoryId },
    );
    return data.category ? mapCategory(data.category) : null;
  },

  async getFieldOptions(
    categoryId: string,
    fieldId: string,
    parentValue?: string,
    search?: string,
  ) {
    const data = await graphqlRequest<{
      categoryFieldOptions: Array<{ value: string; label: string }>;
    }>(
      `query CategoryFieldOptions($categoryId:String!,$fieldId:String!,$parentValue:String,$search:String){
        categoryFieldOptions(categoryId:$categoryId,fieldId:$fieldId,parentValue:$parentValue,search:$search,limit:250){value label}
      }`,
      {
        categoryId,
        fieldId,
        parentValue: parentValue || null,
        search: search || null,
      },
    );
    return data.categoryFieldOptions ?? [];
  },

  async getConfigurations(): Promise<CategoryConfiguration[]> {
    return this.getCategories();
  },
};
