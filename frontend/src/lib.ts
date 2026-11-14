// Set VITE_API_URL in frontend/.env, e.g. VITE_API_URL=https://localhost:7123
export const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const CATS = ["Fiction", "Sci-Fi", "Tech", "History", "Self-Help"];
export const PAL: [string, string][] = [
    ["#17302B", "#EEF1EA"], ["#7A2E5E", "#F6E7F0"], ["#E3A72F", "#17302B"],
    ["#9CC5D8", "#17302B"], ["#3D5A99", "#EAF0FB"], ["#B4436C", "#FFF0F5"],
];
export const $ = (n: number) => "$" + n.toFixed(2);
export const norm = (b: any) => ({ description: `${b.title} by ${b.author}.`, rating: 4.4, stock: 10, ...b });

// Talks to the .NET API. Returns null on any failure so the UI falls back to demo data.
export async function api(path: string, body?: any, method = body ? "POST" : "GET") {
    try {
        const token = localStorage.getItem("token");
        const r = await fetch(BASE + path, {
            method,
            headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!r.ok) return null;
        return r.status === 204 ? {} : await r.json();
    } catch {
        return null;
    }
}

const S: [string, string, string, number][] = [
    ["The Alchemist", "Paulo Coelho", "Fiction", 12.99],
    ["Pride and Prejudice", "Jane Austen", "Fiction", 9.5],
    ["To Kill a Mockingbird", "Harper Lee", "Fiction", 11.25],
    ["Dune", "Frank Herbert", "Sci-Fi", 14.99],
    ["Neuromancer", "William Gibson", "Sci-Fi", 10.99],
    ["The Martian", "Andy Weir", "Sci-Fi", 13.5],
    ["Clean Code", "Robert C. Martin", "Tech", 34.99],
    ["The Pragmatic Programmer", "Hunt & Thomas", "Tech", 39],
    ["Designing Data-Intensive Applications", "Martin Kleppmann", "Tech", 44.5],
    ["Sapiens", "Yuval Noah Harari", "History", 16.99],
    ["Guns, Germs, and Steel", "Jared Diamond", "History", 15.25],
    ["Atomic Habits", "James Clear", "Self-Help", 18],
    ["Deep Work", "Cal Newport", "Self-Help", 15.5],
    ["Man's Search for Meaning", "Viktor Frankl", "Self-Help", 10.75],
];
export const MOCK: any[] = S.map(([title, author, category, price], i) =>
    norm({ id: i + 1, title, author, category, price, rating: 4 + ((i * 7) % 10) / 10, stock: 5 + i })
);
