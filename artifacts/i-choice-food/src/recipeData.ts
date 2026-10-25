export type Dish = {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  image: string;
  vendor: string;
  location: string;
  price: string;
  time: string;
  serves: string;
  ingredients: string[];
  steps: string[];
};

const foodPhoto = (name: string) => `${import.meta.env.BASE_URL}images/${name}.jpg`;

export const dishes: Dish[] = [
  {
    id: 'chicken-adobo', name: 'Chicken Adobo', subtitle: 'The beloved soy-vinegar classic', category: 'Comfort food',
    image: foodPhoto('chicken-adobo'), vendor: 'Tita Nena’s Kitchen (example)', location: 'Quezon City · example area', price: '₱185', time: '55 min', serves: '4 servings',
    ingredients: ['1 kg bone-in chicken thighs', '½ cup cane vinegar', '½ cup soy sauce', '1 cup water', '8 garlic cloves, crushed', '2 bay leaves', '1 tsp whole black peppercorns', '1 tbsp neutral oil'],
    steps: ['Combine chicken, soy sauce, garlic, bay leaves and peppercorns. Marinate for 30 minutes if time allows.', 'Warm oil in a heavy pot. Lift chicken from the marinade and brown on all sides, working in batches.', 'Pour in the marinade, vinegar and water. Bring to a boil uncovered for 5 minutes; do not stir yet.', 'Lower the heat, cover and simmer for 35–40 minutes until tender. Taste and adjust the balance of vinegar and soy.', 'Uncover and reduce the sauce until glossy. Serve hot with steamed rice.'],
  },
  {
    id: 'sinigang-na-baboy', name: 'Sinigang na Baboy', subtitle: 'Bright, tamarind-sour pork soup', category: 'Comfort food',
    image: foodPhoto('sinigang'), vendor: 'Lutong Bahay ni Lita (example)', location: 'Makati · example area', price: '₱220', time: '1 hr 20 min', serves: '5 servings',
    ingredients: ['750 g pork belly or ribs', '8 cups water', '1 onion, quartered', '2 tomatoes, quartered', '1 packet tamarind soup base or ½ cup fresh tamarind pulp', '1 white radish, sliced', '1 eggplant, sliced', '150 g long beans', '2 cups kangkong leaves', 'Fish sauce, to taste'],
    steps: ['Simmer pork in water with onion and tomatoes for 45 minutes, skimming any foam.', 'Add radish and tamarind. Cook until the pork is tender and the broth is lively and sour.', 'Add eggplant and long beans; simmer for 5–7 minutes until just tender.', 'Season with fish sauce. Fold in kangkong and turn off the heat as the leaves wilt.', 'Serve steaming hot with rice and extra fish sauce on the side.'],
  },
  {
    id: 'sisig', name: 'Sisig', subtitle: 'Sizzling, tangy, and made to share', category: 'Street favorites',
    image: foodPhoto('sisig'), vendor: 'Sizzling Corner (example)', location: 'Pasig · example area', price: '₱195', time: '45 min', serves: '3 servings',
    ingredients: ['500 g pork shoulder', '1 small red onion, finely diced', '2 tbsp calamansi juice', '1 tbsp soy sauce', '1 green chili, sliced', '1 tbsp mayonnaise (optional)', '1 tbsp neutral oil', 'Salt and pepper'],
    steps: ['Boil pork shoulder in salted water until tender, about 30 minutes. Drain and cool.', 'Chop the pork into small, uneven pieces. For extra char, sear in a hot pan with oil.', 'Toss with onion, calamansi, soy sauce and chili. Season generously with pepper.', 'Heat a cast-iron plate until very hot. Add the pork mixture and let the edges sizzle.', 'Finish with mayonnaise if you like. Serve immediately with calamansi wedges.'],
  },
  {
    id: 'kwek-kwek', name: 'Kwek-Kwek', subtitle: 'Crispy quail eggs with spiced vinegar', category: 'Street favorites',
    image: foodPhoto('kwek-kwek'), vendor: 'Manong’s Merienda (example)', location: 'Manila · example area', price: '₱45', time: '25 min', serves: '4 servings',
    ingredients: ['16 quail eggs, hard-boiled and peeled', '¾ cup all-purpose flour', '½ cup water', '½ tsp annatto powder', '½ tsp baking powder', 'Salt and pepper', 'Oil for frying', 'Spiced vinegar, for dipping'],
    steps: ['Whisk flour, water, annatto, baking powder, salt and pepper into a smooth, thick batter.', 'Pat eggs completely dry, then dust lightly with flour so the batter clings.', 'Heat 5 cm of oil in a small pot to 175°C. Dip eggs in batter, coating well.', 'Fry in batches for 2–3 minutes until crisp and bright orange. Drain on a rack.', 'Serve hot with spiced vinegar or a sweet chili sauce.'],
  },
  {
    id: 'fish-balls', name: 'Fish Balls', subtitle: 'A street-side favorite, made at home', category: 'Street favorites',
    image: foodPhoto('fish-balls'), vendor: 'Bayanihan Snack Cart (example)', location: 'Taguig · example area', price: '₱35', time: '30 min', serves: '4 servings',
    ingredients: ['400 g white fish fillet, minced', '½ cup tapioca starch', '1 egg white', '2 garlic cloves, minced', '½ tsp salt', '¼ tsp white pepper', 'Neutral oil for frying', 'Sweet brown dipping sauce'],
    steps: ['Pulse fish, starch, egg white, garlic, salt and pepper until a sticky paste forms.', 'With damp hands, roll into small balls and chill for 15 minutes to firm up.', 'Heat oil in a deep pan over medium heat. Fry fish balls in batches until golden and cooked through.', 'Drain briefly, then thread onto skewers for serving.', 'Dip into warm sweet sauce, or serve with a garlicky vinegar dip.'],
  },
  {
    id: 'halo-halo', name: 'Halo-Halo', subtitle: 'A cool, joyful mix of everything', category: 'Sweet things',
    image: foodPhoto('halo-halo'), vendor: 'Araw Dessert Bar (example)', location: 'Mandaluyong · example area', price: '₱155', time: '15 min', serves: '2 servings',
    ingredients: ['2 cups finely shaved ice', '¼ cup sweetened red beans', '¼ cup nata de coco', '¼ cup jackfruit strips', '2 tbsp kaong (sugar palm fruit)', '2 tbsp ube halaya', '2 scoops ube ice cream', '2 slices leche flan', 'Evaporated milk'],
    steps: ['Layer beans, nata de coco, jackfruit, kaong and ube halaya into two tall glasses.', 'Pack each glass high with finely shaved ice.', 'Pour evaporated milk over the ice and top with a slice of leche flan.', 'Add a scoop of ube ice cream to each glass.', 'Serve right away. Mix everything together before the first spoonful.'],
  },
  {
    id: 'pancit-palabok', name: 'Pancit Palabok', subtitle: 'Noodles dressed for a celebration', category: 'Noodles & rice',
    image: foodPhoto('pancit-palabok'), vendor: 'Bahay Panciteria (example)', location: 'Marikina · example area', price: '₱175', time: '50 min', serves: '4 servings',
    ingredients: ['400 g rice noodles', '250 g shrimp, peeled (reserve shells)', '2 tbsp annatto oil', '2 tbsp flour', '3 cups shrimp stock', '½ cup smoked fish flakes', '2 hard-boiled eggs, sliced', 'Calamansi and scallions'],
    steps: ['Soak noodles in warm water until pliable, then drain and set aside.', 'Simmer shrimp shells in water for 15 minutes. Strain to make a fragrant stock.', 'Whisk flour into annatto oil, then slowly add stock. Simmer until thick and silky.', 'Cook noodles according to the package. Toss shrimp in the sauce until just pink.', 'Arrange noodles, pour over sauce, then top with shrimp, egg, smoked fish and scallions.'],
  },
  {
    id: 'lumpiang-shanghai', name: 'Lumpiang Shanghai', subtitle: 'Golden little rolls for the table', category: 'Street favorites',
    image: foodPhoto('lumpia'), vendor: 'The Merienda Table (example)', location: 'San Juan · example area', price: '₱120', time: '40 min', serves: '6 servings',
    ingredients: ['300 g ground pork', '1 small carrot, finely grated', '2 scallions, minced', '1 egg', '1 tbsp soy sauce', '20 small spring roll wrappers', 'Oil for frying', 'Banana ketchup, to serve'],
    steps: ['Mix pork, carrot, scallions, egg and soy sauce until evenly combined.', 'Place a spoonful near the corner of a wrapper. Roll tightly, fold in sides and seal the edge with water.', 'Repeat with the remaining filling and wrappers. Keep rolls covered so they do not dry out.', 'Fry in 2 cm of medium-hot oil, turning until evenly crisp and deep golden.', 'Drain on a rack and serve with banana ketchup.'],
  },
  {
    id: 'kare-kare', name: 'Kare-Kare', subtitle: 'Peanut-rich stew with all the fixings', category: 'Comfort food',
    image: foodPhoto('sinigang'), vendor: 'Sunday Table (example)', location: 'Caloocan · example area', price: '₱245', time: '2 hr', serves: '6 servings',
    ingredients: ['1 kg oxtail or beef shank', '½ cup smooth peanut butter', '2 tbsp toasted rice flour', '1 banana flower, sliced', '1 bundle pechay', '1 eggplant, sliced', '1 tbsp annatto oil', 'Bagoong, to serve'],
    steps: ['Simmer oxtail in water until tender, about 1½–2 hours. Reserve the broth.', 'Whisk peanut butter and toasted rice flour into 4 cups of broth until smooth.', 'Warm annatto oil in a pot. Add meat and peanut broth; simmer gently until thick.', 'Add eggplant and banana flower, cooking until tender. Fold in pechay at the end.', 'Serve with bagoong on the side and plenty of steamed rice.'],
  },
];

export const categories = ['All dishes', 'Comfort food', 'Street favorites', 'Noodles & rice', 'Sweet things'];
