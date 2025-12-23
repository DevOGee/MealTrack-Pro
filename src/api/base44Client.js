
const entities = ['Meal', 'PantryItem', 'ShoppingItem', 'SpendingRecord', 'UserSettings'];

// Initial Seed Data for demo purposes
const seedData = {
    UserSettings: [{
        breakfast_time: '07:00',
        lunch_time: '13:00',
        dinner_time: '20:00',
        monthly_budget: 6000,
        food_preference: 'kenyan'
    }],
    Meal: [],
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
                return {
                    days: Array.from({ length: 7 }, (_, i) => ({
                        breakfast: { name: "Oatmeal with Milk", cost: 60, prep_notes: "Heat milk" },
                        lunch: { name: "Rice and Beans", cost: 120, prep_notes: "Use leftover beans" },
                        dinner: { name: "Ugali and Skuma", cost: 80, prep_notes: "Cook fresh" }
                    }))
                };
            }
        }
    }
};
