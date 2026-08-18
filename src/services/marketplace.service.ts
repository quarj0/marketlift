import { categoryService } from '@/services/category.service';

export const marketplaceService = {
  getCategories: categoryService.getCategories,
};
