export type Unit = 'lbs' | 'oz' | 'cups' | 'tbsp' | 'tsp' | 'items' | 'cloves' | 'cans';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: Unit;
}

export interface Meal {
  id: string;
  name: string;
  tags: string[];
  ingredients: Ingredient[];
}

export const ALL_TAGS = ['Breakfast', 'Lunch', 'Dinner', 'High Protein', 'Vegetarian', 'Quick'];

export const mockMeals: Meal[] = [
  {
    id: '1',
    name: 'Chicken Rice Bowl',
    tags: ['Lunch', 'Dinner', 'High Protein'],
    ingredients: [
      { name: 'Chicken Breast', quantity: 2, unit: 'lbs' },
      { name: 'White Rice', quantity: 2, unit: 'cups' },
      { name: 'Olive Oil', quantity: 2, unit: 'tbsp' },
      { name: 'Garlic', quantity: 3, unit: 'cloves' },
    ],
  },
  {
    id: '2',
    name: 'Egg & Veggie Scramble',
    tags: ['Breakfast', 'High Protein', 'Quick'],
    ingredients: [
      { name: 'Eggs', quantity: 6, unit: 'items' },
      { name: 'Bell Pepper', quantity: 1, unit: 'items' },
      { name: 'Olive Oil', quantity: 1, unit: 'tbsp' },
      { name: 'Spinach', quantity: 2, unit: 'cups' },
    ],
  },
  {
    id: '3',
    name: 'Beef Stir Fry',
    tags: ['Dinner', 'High Protein'],
    ingredients: [
      { name: 'Ground Beef', quantity: 1, unit: 'lbs' },
      { name: 'Broccoli', quantity: 2, unit: 'cups' },
      { name: 'Soy Sauce', quantity: 3, unit: 'tbsp' },
      { name: 'Garlic', quantity: 2, unit: 'cloves' },
      { name: 'White Rice', quantity: 1, unit: 'cups' },
    ],
  },
  {
    id: '4',
    name: 'Black Bean Tacos',
    tags: ['Lunch', 'Vegetarian', 'Quick'],
    ingredients: [
      { name: 'Black Beans', quantity: 2, unit: 'cans' },
      { name: 'Corn Tortillas', quantity: 8, unit: 'items' },
      { name: 'Shredded Cheese', quantity: 4, unit: 'oz' },
      { name: 'Salsa', quantity: 1, unit: 'cups' },
    ],
  },
  {
    id: '5',
    name: 'Overnight Oats',
    tags: ['Breakfast', 'Vegetarian', 'Quick'],
    ingredients: [
      { name: 'Rolled Oats', quantity: 2, unit: 'cups' },
      { name: 'Milk', quantity: 2, unit: 'cups' },
      { name: 'Honey', quantity: 2, unit: 'tbsp' },
      { name: 'Chia Seeds', quantity: 2, unit: 'tbsp' },
    ],
  },
];
