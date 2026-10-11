"use strict";
// A small client for Buffer's GraphQL API (https://developers.buffer.com).
// It reads the input types from the API itself, so small schema changes on
// Buffer's side are picked up rather than breaking the weekly run.
var ENDPOINT = "https://api.buffer.com";

async function gql(query, variables) {
  var key = process.env.BUFFER_API_KEY;
  if (!key) throw new Error("BUFFER_API_KEY is not set");
  var res = await fetch(ENDPOINT, { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + key },
    body: JSON.stringify({ query: query, variables: variables || {} }) });
  var j = await res.json().catch(function () { return {}; });
  if (!res.ok || j.errors) throw new Error("Buffer API " + res.status + ": " + JSON.stringify(j.errors || j).slice(0, 600));
  return j.data;
}

var TYPE_REF = "kind name ofType { kind name ofType { kind name ofType { kind name } } }";
function base(t) { while (t && t.ofType) t = t.ofType; return t; }
async function typeInfo(name) {
  var d = await gql("query($n:String!){__type(name:$n){name kind inputFields{name type{" + TYPE_REF + "}} enumValues{name}}}", { n: name });
  return d.__type;
}
function field(t, re) { return t && t.inputFields ? t.inputFields.find(function (f) { return re.test(f.name); }) : null; }

async function schema() {
  var s = { create: await typeInfo("CreatePostInput") };
  if (!s.create) throw new Error("Buffer API has no CreatePostInput type");
  var meta = field(s.create, /^metadata$/);
  s.meta = meta ? await typeInfo(base(meta.type).name) : null;
  var assets = field(s.create, /^assets$/);
  s.asset = assets ? await typeInfo(base(assets.type).name) : null;
  var img = field(s.asset, /^image$/), vid = field(s.asset, /^video$/);
  s.image = img ? await typeInfo(base(img.type).name) : null;
  s.video = vid ? await typeInfo(base(vid.type).name) : null;
  var pin = field(s.meta, /^pinterest$/i), ig = field(s.meta, /^instagram$/i);
  s.pinterest = pin ? await typeInfo(base(pin.type).name) : null;
  s.instagram = ig ? await typeInfo(base(ig.type).name) : null;
  if (s.instagram) {
    var t = field(s.instagram, /^type$/);
    if (t && base(t.type).kind === "ENUM") s.instagramTypes = (await typeInfo(base(t.type).name)).enumValues.map(function (v) { return v.name; });
  }
  var mode = field(s.create, /^mode$/), sched = field(s.create, /^schedulingType$/);
  if (mode && base(mode.type).kind === "ENUM") s.modes = (await typeInfo(base(mode.type).name)).enumValues.map(function (v) { return v.name; });
  if (sched && base(sched.type).kind === "ENUM") s.schedulingTypes = (await typeInfo(base(sched.type).name)).enumValues.map(function (v) { return v.name; });
  return s;
}

async function channels() {
  var d = await gql("query{account{organizations{id name}}}");
  var out = [];
  for (var i = 0; i < d.account.organizations.length; i++) {
    var org = d.account.organizations[i];
    var c = await gql("query($o:OrganizationId!){channels(input:{organizationId:$o}){id name service metadata{__typename ... on PinterestMetadata{boards{id name serviceId}}}}}", { o: org.id });
    c.channels.forEach(function (ch) { ch.organizationId = org.id; out.push(ch); });
  }
  return out;
}

function names(t) { return t && t.inputFields ? t.inputFields.map(function (f) { return f.name; }) : []; }

// Builds CreatePostInput for one of our posts.
function postInput(s, ch, post, mediaUrls) {
  var input = { channelId: ch.id, text: post.text, schedulingType: "automatic",
    mode: "customScheduled", dueAt: post.dueAt, assets: [] };
  var isVideo = /\.mp4$/.test(mediaUrls[0]);
  if (isVideo) {
    var v = { url: mediaUrls[0] };
    // Buffer refuses thumbnailUrl; the cover frame is picked with thumbnailOffset instead.
    if (field(s.video, /^metadata$/)) v.metadata = { thumbnailOffset: 3000 };
    input.assets.push({ video: v });
  } else {
    mediaUrls.forEach(function (u) { input.assets.push({ image: { url: u } }); });
  }
  var meta = {};
  if (post.channel === "pinterest" && s.pinterest) {
    var pm = {}, board = (ch.metadata && ch.metadata.boards || []);
    var b = board.find(function (x) { return /dinners for one/i.test(x.name); }) || board[0];
    if (!b) throw new Error("The Pinterest account has no boards yet. Create a board called Dinners for one on Pinterest, then refresh the channel in Buffer.");
    s.pinterest.inputFields.forEach(function (f) {
      if (/^boardServiceId$/i.test(f.name) && b) pm[f.name] = b.serviceId;
      else if (/^boardId$/i.test(f.name) && b) pm[f.name] = b.id;
      else if (/^board$/i.test(f.name) && b) pm[f.name] = base(f.type).kind === "INPUT_OBJECT" ? { serviceId: b.serviceId, name: b.name } : b.serviceId;
      else if (/^title$/i.test(f.name)) pm[f.name] = post.title;
      else if (/^(url|link|destinationUrl|destinationLink|sourceUrl)$/i.test(f.name)) pm[f.name] = post.link;
      else if (/^thumbnailOffset$/i.test(f.name) && isVideo) pm[f.name] = 3000;
    });
    meta[field(s.meta, /^pinterest$/i).name] = pm;
  }
  if (post.channel === "instagram" && s.instagram) {
    var im = {};
    s.instagram.inputFields.forEach(function (f) {
      if (/^type$/.test(f.name)) {
        // Buffer lists "carousel" in the schema but rejects it for Instagram:
        // a "post" with several images goes out as a carousel.
        var want = post.kind === "reel" ? /^reel$/i : /^post$/i;
        var v2 = (s.instagramTypes || []).find(function (x) { return want.test(x); });
        if (v2) im[f.name] = v2;
      } else if (/^shouldShareToFeed$/.test(f.name)) im[f.name] = true;
      else if (/^isAiGenerated$/.test(f.name)) im[f.name] = true;
      else if (/^thumbnailOffset$/i.test(f.name) && isVideo) im[f.name] = 3000;
    });
    meta[field(s.meta, /^instagram$/i).name] = im;
  }
  if (Object.keys(meta).length && field(s.create, /^metadata$/)) input.metadata = meta;
  // Drop anything the API does not know about.
  Object.keys(input).forEach(function (k) { if (names(s.create).indexOf(k) === -1) delete input[k]; });
  return input;
}

async function createPost(input) {
  var d = await gql("mutation($i:CreatePostInput!){createPost(input:$i){__typename ... on PostActionSuccess{post{id dueAt}} ... on MutationError{message}}}", { i: input });
  var r = d.createPost;
  if (r.post) return r.post;
  throw new Error(r.message || JSON.stringify(r));
}

module.exports = { schema: schema, channels: channels, postInput: postInput, createPost: createPost, names: names };
