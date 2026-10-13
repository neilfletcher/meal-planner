/*
 * The weekly email list, kept in Kit (kit.com) on its free plan.
 *
 * KIT_API_KEY (a v4 API key) is a secret in Cloudflare. Everyone who signs up
 * is tagged "Solo Supper" and with where they signed up ("Source: footer",
 * "Source: recipe", "Source: planner", "Source: book buyer"), so you can
 * email groups separately later. Unsubscribing is handled by Kit.
 */
import { httpError } from "./google.js";

var BASE = "https://api.kit.com/v4/";

export async function kit(env, method, path, body) {
  if (!env.KIT_API_KEY) throw httpError(503, "The email list isn't set up yet.");
  var r = await fetch(BASE + path, {
    method: method,
    headers: { "X-Kit-Api-Key": env.KIT_API_KEY, "content-type": "application/json", accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  var j = await r.json().catch(function () { return {}; });
  if (!r.ok) {
    var msg = (j.errors && j.errors.join(", ")) || ("Kit error " + r.status);
    throw httpError(r.status === 422 ? 400 : 502, msg);
  }
  return j;
}

// Tag ids by name, looked up once per server instance (creating a tag that
// already exists just returns it).
var tagIds = {};
async function tagId(env, name) {
  if (tagIds[name]) return tagIds[name];
  var j = await kit(env, "POST", "tags", { name: name });
  tagIds[name] = j.tag.id;
  return tagIds[name];
}

export var SOURCES = { footer: "Source: footer", recipe: "Source: recipe", home: "Source: home page", planner: "Source: planner", books: "Source: book buyer" };

export function validEmail(e) {
  return typeof e === "string" && e.length <= 254 && /^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]{2,}$/.test(e);
}

// Adds (or keeps) someone on the list and tags them. Someone who
// unsubscribed earlier stays unsubscribed (Kit doesn't let this change it).
export async function subscribe(env, email, source, firstName) {
  email = String(email).trim().toLowerCase();
  if (!validEmail(email)) throw httpError(400, "That email address doesn't look right.");
  var body = { email_address: email };
  if (firstName) body.first_name = String(firstName).slice(0, 60);
  var created = await kit(env, "POST", "subscribers", body);
  var names = ["Solo Supper"].concat(SOURCES[source] ? [SOURCES[source]] : []);
  for (var i = 0; i < names.length; i++) {
    try { await kit(env, "POST", "tags/" + (await tagId(env, names[i])) + "/subscribers", { email_address: email }); }
    catch (e) { /* tagging is a nice-to-have */ }
  }
  return { email: email, state: created.subscriber && created.subscriber.state };
}
