
const entities = ['Meal', 'PantryItem', 'ShoppingItem', 'SpendingRecord', 'UserSettings'];

// Initial Seed Data for demo purposes
const seedData = {
    UserSettings: [{
        breakfast_time: '07:00',
        lunch_time: '13:00',
        dinner_time: '20:00',
        monthly_budget: 6000
    }],
    Meal: [], // Will be empty initially
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
                // strict equality or partial match?
                // For dates, string match is fine.
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
        const newItem = { id: Date.now().toString(), ...item };
        data.push(newItem);
        localStorage.setItem(entityName, JSON.stringify(data));
        return newItem;
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
    }, {})
};
