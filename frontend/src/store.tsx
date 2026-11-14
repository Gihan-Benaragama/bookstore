import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { MOCK, api, norm } from "./lib";
import { Ctx } from "./ctx";

const load = (k: string, d: any) => { try { return JSON.parse(localStorage.getItem(k) || "") ?? d; } catch { return d; } };

export function Provider({ children }: { children: ReactNode }) {
    const [books, setBooks] = useState<any[]>(MOCK);
    const [cart, setCart] = useState<Record<number, number>>(() => load("cart", {}));
    const [user, setUser] = useState<any>(() => load("user", null));
    const [orders, setOrders] = useState<any[]>(() => load("orders", []));
    const [open, setOpen] = useState(false);
    const [toast, setToast] = useState("");

    useEffect(() => { api("/api/books").then((d) => { const list = d?.items ?? d; if (Array.isArray(list) && list.length) setBooks(list.map(norm)); }); }, []);
    useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);
    useEffect(() => localStorage.setItem("user", JSON.stringify(user)), [user]);
    useEffect(() => localStorage.setItem("orders", JSON.stringify(orders)), [orders]);

    const say = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2200); };
    const add = (id: number, n = 1) => { setCart((c) => ({ ...c, [id]: (c[id] || 0) + n })); say("Added to cart"); };
    const setQty = (id: number, n: number) => setCart((c) => { const x = { ...c }; if (n <= 0) delete x[id]; else x[id] = n; return x; });

    const lines = Object.entries(cart).map(([id, qty]) => ({ book: books.find((b) => b.id === +id), qty })).filter((l) => l.book);
    const total = lines.reduce((s, l) => s + l.book.price * l.qty, 0);
    const count = lines.reduce((s, l) => s + l.qty, 0);

    const placeOrder = () => {
        const o = { id: Date.now(), date: new Date().toISOString(), status: "Processing", total, items: lines.map((l) => ({ title: l.book.title, qty: l.qty, price: l.book.price })) };
        api("/api/orders", { items: lines.map((l) => ({ bookId: l.book.id, quantity: l.qty })) });
        setOrders((x) => [o, ...x]); setCart({});
    };

    const login = async (email: string, name?: string, password?: string, register = false) => {
        const res = await api(register ? "/api/auth/register" : "/api/auth/login", { email, password, name });
        if (res?.token) localStorage.setItem("token", res.token);
        const u = res?.user ?? { name: name || email.split("@")[0], email, role: email.includes("admin") ? "Admin" : "Customer" };
        setUser(u); say("Welcome, " + u.name);
    };
    const logout = () => { setUser(null); localStorage.removeItem("token"); say("Logged out"); };

    const addBook = (b: any) => { api("/api/books", b); setBooks((x) => [norm({ ...b, id: Date.now() }), ...x]); say("Book added"); };
    const removeBook = (id: number) => { api("/api/books/" + id, undefined, "DELETE"); setBooks((x) => x.filter((b) => b.id !== id)); say("Book removed"); };

    return <Ctx.Provider value={{ books, cart, user, orders, open, setOpen, toast, add, setQty, lines, total, count, placeOrder, login, logout, addBook, removeBook }}>{children}</Ctx.Provider>;
}
