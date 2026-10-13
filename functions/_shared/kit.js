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

// Where someone stands on the list: "active", "cancelled" (unsubscribed),
// another Kit state, or "none" if Kit has never had the address.
export async function findSubscriber(env, email) {
  var j = await kit(env, "GET", "subscribers?status=all&email_address=" + encodeURIComponent(String(email).trim().toLowerCase()));
  return (j.subscribers || [])[0] || null;
}
export async function subscriberState(env, email) {
  var s = await findSubscriber(env, email);
  return s ? s.state : "none";
}
export async function unsubscribe(env, email) {
  var s = await findSubscriber(env, email);
  if (s && s.state === "active") await kit(env, "POST", "subscribers/" + s.id + "/unsubscribe", {});
  return "cancelled";
}
// Joining again after unsubscribing: Kit keeps unsubscribes, so the person
// asked for this themselves (the settings switch). Kit's v4 API won't undo an
// unsubscribe, but its older v3 form endpoint will: set KIT_API_KEY_V3 (Kit >
// Settings > Developer > v3 API key) and KIT_FORM_ID (any form in Kit).
// If the form uses double opt-in, Kit emails a confirm link first.
async function v3FormSubscribe(env, email) {
  var r = await fetch("https://api.kit.com/v3/forms/" + env.KIT_FORM_ID + "/subscribe", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ api_key: env.KIT_API_KEY_V3, email: email })
  });
  var j = await r.json().catch(function () { return {}; });
  if (!r.ok) throw new Error(j.message || j.error || ("Kit v3 error " + r.status));
  // Kit's search can lag a few seconds behind, so go by what this call says.
  var sub = j.subscription || {};
  return sub.state || (sub.subscriber && sub.subscriber.state) || "";
}
export async function resubscribe(env, email, source) {
  email = String(email).trim().toLowerCase();
  await subscribe(env, email, source);
  var state = await subscriberState(env, email), note = "";
  if (state !== "active") {
    if (!env.KIT_FORM_ID) note = "KIT_FORM_ID isn't set";
    else if (env.KIT_API_KEY_V3) {
      var v3 = "";
      try { v3 = await v3FormSubscribe(env, email); note = "v3 form " + env.KIT_FORM_ID + (v3 ? " said " + v3 : ""); }
      catch (e) { note = "v3 form " + env.KIT_FORM_ID + ": " + e.message; }
      state = v3 === "active" || v3 === "inactive" ? v3 : await subscriberState(env, email);
    } else {
      try { await kit(env, "POST", "forms/" + env.KIT_FORM_ID + "/subscribers", { email_address: email }); note = "added to form " + env.KIT_FORM_ID + "; KIT_API_KEY_V3 isn't set"; }
      catch (e) { note = "form " + env.KIT_FORM_ID + ": " + e.message; }
      state = await subscriberState(env, email);
    }
  }
  return { state: state, note: note };
}
