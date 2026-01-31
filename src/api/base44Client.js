
const entities = ['Meal', 'PantryItem', 'ShoppingItem', 'SpendingRecord', 'UserSettings'];

// Initial Seed Data for demo purposes
const currentMonth = new Date().toISOString().slice(0, 7);

const seedData = {
    UserSettings: [{
        id: 'settings-1',
        breakfast_time: '07:00',
        lunch_time: '13:00',
        dinner_time: '20:00',
        monthly_budget: 6000,
        food_preference: 'kenyan',
        household_size: 2
    }],
    Meal: [],
    ShoppingItem: [
        { id: 'shop-1', name: 'Maize Meal (2kg)', category: 'staples', quantity: '2 packets', price: 230, purchased: true, month: currentMonth },
        { id: 'shop-2', name: 'Cooking Oil (1L)', category: 'staples', quantity: '1 bottle', price: 350, purchased: true, month: currentMonth },
        { id: 'shop-3', name: 'Sukuma Wiki', category: 'vegetables', quantity: '3 bunches', price: 60, purchased: true, month: currentMonth },
        { id: 'shop-4', name: 'Tomatoes', category: 'vegetables', quantity: '1 kg', price: 120, purchased: false, month: currentMonth },
        { id: 'shop-5', name: 'Beef (500g)', category: 'proteins', quantity: '500g', price: 350, purchased: true, month: currentMonth },
        { id: 'shop-6', name: 'Milk', category: 'dairy', quantity: '2 liters', price: 140, purchased: false, month: currentMonth },
        { id: 'shop-7', name: 'Eggs', category: 'proteins', quantity: '6', price: 120, purchased: true, month: currentMonth }
    ],
    PantryItem: [
        { id: 'pantry-1', name: 'Rice', category: 'staples', quantity: '3', unit: 'kg', last_updated: new Date().toISOString().slice(0, 10), low_stock_threshold: '1' },
        { id: 'pantry-2', name: 'Salt', category: 'spices', quantity: '500', unit: 'g', last_updated: new Date().toISOString().slice(0, 10) },
        { id: 'pantry-3', name: 'Onions', category: 'vegetables', quantity: '5', unit: 'pcs', last_updated: new Date().toISOString().slice(0, 10), low_stock_threshold: '2' }
    ]
};

const createEntityClient = (entityName) => ({
    list: async () => {
        let data = JSON.parse(localStorage.getItem(entityName));
        if (!data && seedData[entityName]) {
            data = seedData[entityName];
            localStorage.setItem(entityName, JSON.stringify(data));
        }
        return data || [];
    },
    filter: async (criteria) => {
        let data = JSON.parse(localStorage.getItem(entityName));
        if (!data && seedData[entityName]) {
            data = seedData[entityName];
            localStorage.setItem(entityName, JSON.stringify(data));
        }
        data = data || [];

        return data.filter(item => {
            return Object.entries(criteria).every(([key, value]) => {
                return item[key] == value;
            });
        });
    },
    update: async (id, updates) => {
        const data = JSON.parse(localStorage.getItem(entityName) || '[]');
        const index = data.findIndex(i => i.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates };
            localStorage.setItem(entityName, JSON.stringify(data));
            return data[index];
        }
        return null;
    },
    create: async (item) => {
        const data = JSON.parse(localStorage.getItem(entityName) || '[]');
        const newItem = { id: Date.now().toString() + Math.random().toString(36).substr(2, 5), ...item };
        data.push(newItem);
        localStorage.setItem(entityName, JSON.stringify(data));
        return newItem;
    },
    bulkCreate: async (items) => {
        const data = JSON.parse(localStorage.getItem(entityName) || '[]');
        const newItems = items.map(item => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            ...item
        }));
        data.push(...newItems);
        localStorage.setItem(entityName, JSON.stringify(data));
        return newItems;
    },
    delete: async (id) => {
        const data = JSON.parse(localStorage.getItem(entityName) || '[]');
        const newData = data.filter(i => i.id !== id);
        localStorage.setItem(entityName, JSON.stringify(newData));
        return true;
    }
});

export const base44 = {
    entities: entities.reduce((acc, entity) => {
        acc[entity] = createEntityClient(entity);
        return acc;
    }, {}),
    integrations: {
        Core: {
            InvokeLLM: async ({ prompt }) => {
                console.log("Mock LLM invoked with:", prompt);
                await new Promise(r => setTimeout(r, 1500)); // Simulate delay

                // 1. Analytics Insights
                if (prompt.includes("Analyze this meal planning data")) {
                    return {
                        insights: [
                            { type: "success", message: "Great job staying within budget so far!" },
                            { type: "tip", message: "Try buying beans in bulk to save ~200 KES." },
                            { type: "warning", message: " Dinner costs are 15% higher than average." },
                            { type: "saving", message: "You saved 500 KES by cooking 5 days straight." }
                        ]
                    };
                }

                // 2. Shopping List
                if (prompt.includes("Generate a shopping list")) {
                    return {
                        items: [
                            { name: "Maize Meal (2kg)", category: "staples", quantity: "1 packet", price: 230 },
                            { name: "Cooking Oil (1L)", category: "staples", quantity: "1 bottle", price: 350 },
                            { name: "Sukuma Wiki", category: "vegetables", quantity: "3 bunches", price: 60 },
                            { name: "Tomatoes", category: "vegetables", quantity: "1 kg", price: 120 },
                            { name: "Beef (500g)", category: "proteins", quantity: "500g", price: 350 },
                            { name: "Milk", category: "dairy", quantity: "2 liters", price: 140 },
                            { name: "Eggs", category: "proteins", quantity: "6", price: 120 }
                        ]
                    };
                }

                // 3. Recipe Generation
                if (prompt.includes("detailed recipe")) {
                    return {
                        ingredients: [
                            { name: "Maize Flour", quantity: "2 cups", in_pantry: true },
                            { name: "Water", quantity: "3 cups", in_pantry: true },
                            { name: "Sukuma Wiki", quantity: "1 bunch", in_pantry: false },
                            { name: "Onion", quantity: "1 medium", in_pantry: true },
                            { name: "Tomato", quantity: "1 large", in_pantry: true },
                            { name: "Oil", quantity: "1 tbsp", in_pantry: true }
                        ],
                        instructions: [
                            "Boil water in a sufuria.",
                            "Stir in maize flour gradually until firm.",
                            "Cover and cook for 5 minutes.",
                            "In another pan, fry onions and tomatoes.",
                            "Add chopped sukuma wiki and simmer for 5 minutes.",
                            "Serve hot."
                        ],
                        prep_time: "10 mins",
                        cook_time: "20 mins",
                        servings: 2,
                        nutrition: {
                            calories: 450,
                            protein: 12,
                            carbs: 80,
                            fats: 8,
                            fiber: 15
                        },
                        tips: [
                            "Use leftover ugly for breakfast with tea.",
                            "Add spinach for more vitamins."
                        ]
                    };
                }

                // 4. Meal Swaps
                if (prompt.includes("Suggest 2-3 alternative meals")) {
                    return {
                        suggestions: [
                            { name: "Githeri (Bean Stew)", estimated_cost: 90, pantry_usage_score: 80, reason: "Uses beans from pantry and is cheaper." },
                            { name: "Chapati & Ndengu", estimated_cost: 110, pantry_usage_score: 60, reason: "High protein and very filling." },
                            { name: "Rice & Cabbage", estimated_cost: 70, pantry_usage_score: 90, reason: "Super budget friendly and quick." }
                        ]
                    };
                }

                // Generate varied meals based on period
                const breakfastOptions = [
                    { name: "Mandazi and Tea", cost: 50, prep_notes: "Fry mandazi or buy fresh" },
                    { name: "Oatmeal with Milk", cost: 60, prep_notes: "Cook with honey" },
                    { name: "Chapati and Eggs", cost: 80, prep_notes: "Scrambled or fried" },
                    { name: "Uji (Porridge)", cost: 30, prep_notes: "Add sugar and lemon" },
                    { name: "Toast and Avocado", cost: 70, prep_notes: "Fresh morning meal" },
                    { name: "Samosa and Tea", cost: 55, prep_notes: "Buy or make ahead" },
                    { name: "Mahamri and Chai", cost: 45, prep_notes: "Sweet coconut bread" },
                    { name: "Pancakes", cost: 65, prep_notes: "With honey or jam" },
                    { name: "Boiled Eggs and Bread", cost: 50, prep_notes: "Quick protein breakfast" },
                    { name: "Fruit Salad", cost: 60, prep_notes: "Seasonal fruits" }
                ];

                const lunchOptions = [
                    { name: "Rice and Beans", cost: 120, prep_notes: "Cook with onions and tomatoes" },
                    { name: "Pilau with Kachumbari", cost: 150, prep_notes: "Use pilau masala" },
                    { name: "Chapati and Ndengu", cost: 100, prep_notes: "Green grams stew" },
                    { name: "Githeri", cost: 90, prep_notes: "Maize and beans mix" },
                    { name: "Matoke and Beef", cost: 180, prep_notes: "Slow cook the matoke" },
                    { name: "Mukimo and Stew", cost: 130, prep_notes: "Mashed with greens" },
                    { name: "Biriani", cost: 200, prep_notes: "Special occasion meal" },
                    { name: "Fish and Ugali", cost: 170, prep_notes: "Fried tilapia" },
                    { name: "Spaghetti Bolognese", cost: 140, prep_notes: "With minced meat" },
                    { name: "Chicken Stew and Rice", cost: 190, prep_notes: "Sunday lunch style" }
                ];

                const dinnerOptions = [
                    { name: "Ugali and Sukuma Wiki", cost: 80, prep_notes: "Classic Kenyan dinner" },
                    { name: "Chapati and Beans", cost: 110, prep_notes: "Filling dinner" },
                    { name: "Rice and Cabbage", cost: 70, prep_notes: "Budget friendly" },
                    { name: "Ugali and Omena", cost: 100, prep_notes: "With silver fish" },
                    { name: "Mashed Potatoes and Greens", cost: 90, prep_notes: "Comfort food" },
                    { name: "Wali wa Nazi", cost: 130, prep_notes: "Coconut rice with fish" },
                    { name: "Ugali and Beef Stew", cost: 150, prep_notes: "Hearty dinner" },
                    { name: "Vegetable Curry and Rice", cost: 100, prep_notes: "Spiced vegetables" },
                    { name: "Mokimo", cost: 85, prep_notes: "With avocado" },
                    { name: "Sima and Kunde", cost: 75, prep_notes: "Cowpeas and ugali" }
                ];

                // Parse the number of days from the prompt
                let numDays = 7;
                if (prompt.includes("14 days")) numDays = 14;
                else if (prompt.includes("30 days") || prompt.includes("entire month") || prompt.includes("full month")) numDays = 30;
                else if (prompt.includes("week")) numDays = 7;

                const getRandomItem = (arr, usedIndices, prefix) => {
                    const key = prefix;
                    if (!usedIndices[key]) usedIndices[key] = [];

                    let availableIndices = arr.map((_, i) => i).filter(i => !usedIndices[key].includes(i));
                    if (availableIndices.length === 0) {
                        usedIndices[key] = [];
                        availableIndices = arr.map((_, i) => i);
                    }

                    const idx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
                    usedIndices[key].push(idx);
                    return { ...arr[idx] };
                };

                const usedIndices = {};
                const days = Array.from({ length: numDays }, (_, i) => ({
                    breakfast: getRandomItem(breakfastOptions, usedIndices, 'breakfast'),
                    lunch: getRandomItem(lunchOptions, usedIndices, 'lunch'),
                    dinner: getRandomItem(dinnerOptions, usedIndices, 'dinner')
                }));

                return { days };
            }
        }
    }
};
