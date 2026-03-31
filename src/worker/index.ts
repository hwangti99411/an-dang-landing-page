import { Hono } from "hono";
import {Env} from '../types/index'
const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

export default app;
