/*
 * Legal pages for solosupper.co.uk: privacy, terms, cookies and refunds.
 * build-site.js turns each entry into /<slug>/index.html.
 * Edit the text here, then run `node scripts/build-site.js`.
 *
 * {EMAIL} and {SITE} are filled in by the build.
 */
var UPDATED = "16 October 2026";

module.exports = [
  {
    slug: "privacy",
    title: "Privacy policy",
    description: "What Solo Supper collects, why, who it is shared with and how to have it deleted.",
    html: [
      "<p>Solo Supper is run by Neil Fletcher, a sole trader based in England. I am the data controller for the personal information described here. If you have any question about it, email <a href=\"mailto:{EMAIL}\">{EMAIL}</a>.</p>",
      "<p>This policy covers the website at {SITE} and the Solo Supper app for Android.</p>",

      "<h2>The short version</h2>",
      "<ul>",
      "<li>You can read every recipe and plan your week without an account. Your plan is then kept only in your own browser or phone.</li>",
      "<li>If you sign in, your plan is stored against your account so it syncs between devices.</li>",
      "<li>Usage statistics are only collected if you say yes to them.</li>",
      "<li>I do not sell your information, and I do not use it for advertising.</li>",
      "</ul>",

      "<h2>What I collect and why</h2>",
      "<h3>If you use Solo Supper without signing in</h3>",
      "<p>Your week, shopping list ticks, ratings, preferences and any recipes you add are saved in your browser's local storage (or the app's storage on your phone). They never leave your device, and I cannot see them.</p>",

      "<h3>If you sign in</h3>",
      "<p>Signing in uses Google sign-in or a link sent to your email address. I receive your name, email address and a unique account ID. Your planner data (the dinners you plan, recipes you mark as cooked, ratings, shopping list ticks, cupboard staples, dislikes, your own recipes and settings) is then stored in your account so it can sync between devices.</p>",
      "<p><strong>Legal basis:</strong> providing the service you asked for (contract).</p>",

      "<h3>Dislikes and allergies</h3>",
      "<p>If you choose to hide recipes containing things like nuts, gluten or dairy, that choice is stored with the rest of your planner data. It could suggest something about your health, so it is used only to filter recipes for you and for nothing else. Storing it is your choice, and you can clear it at any time in settings.</p>",
      "<p><strong>Legal basis:</strong> your explicit consent, given when you switch the option on.</p>",

      "<h3>Usage statistics</h3>",
      "<p>If you say yes in the cookie banner, the site uses Google Analytics to count visits and see which pages and features are used. IP addresses are anonymised. If you say no, or ignore the banner, Google Analytics is not loaded. You can change your mind at any time from <a href=\"#cookie-settings\">cookie settings</a>.</p>",
      "<p>If you say yes, your browser also remembers how you first found Solo Supper (for example Pinterest, a search engine or a link with a campaign name) and the page you arrived on. If you then create an account, that is saved with it, so I can see which channels lead to people signing up and subscribing. If you say no, it is not kept.</p>",
      "<p><strong>Legal basis:</strong> your consent.</p>",
      "<p>Separately, Cloudflare Web Analytics counts page views from every visitor, without cookies, without storing anything on your device and without identifying you. It notes the page, the site you came from, your country and the kind of device, and I only ever see totals.</p>",
      "<p><strong>Legal basis:</strong> legitimate interests (knowing how many people use the site and which pages help).</p>",

      "<h3>Pro subscriptions</h3>",
      "<p>On the website, Pro is sold through Stripe's Managed Payments service, with Onelink (Stripe's checkout service, formerly Link) acting as the merchant of record. Onelink takes your payment details and handles payment, tax, receipts and renewal reminders; I never see your card details. I receive your email address, what you bought and whether your subscription is active, so that Pro can be switched on for your account. In the Android app, purchases go through Google Play in the same way.</p>",
      "<p><strong>Legal basis:</strong> contract, and keeping financial records the law requires.</p>",

      "<h3>Error reports</h3>",
      "<p>If one of the site's scripts breaks in your browser, it sends a short error report: the error message, which file and line, the page you were on and your browser type. It contains nothing that identifies you, and is used only to find and fix bugs.</p>",
      "<p><strong>Legal basis:</strong> legitimate interests (keeping the site working).</p>",

      "<h3>The weekly email</h3>",
      "<p>If you sign up for the weekly email (on the website, in the planner, or by ticking the box when you buy a cookbook), your email address is kept by Kit, the service that sends it, with a note of where you signed up. You get one email a week with dinner ideas, tips for the planner and occasionally news about Solo Supper's books and Pro. Every email has an unsubscribe link, and unsubscribing stops them straight away. Kit records whether emails are opened and links clicked, so I can see what's useful.</p>",
      "<p><strong>Legal basis:</strong> your consent, which you can withdraw at any time by unsubscribing.</p>",

      "<h3>Emails</h3>",
      "<p>If you email me, I keep the conversation so I can reply and help. I send sign-in links and replies, and nothing else. There is no marketing email unless you have separately signed up for it.</p>",

      "<h2>Who your information is shared with</h2>",
      "<p>Only the services that make Solo Supper work, each acting on my instructions:</p>",
      "<ul>",
      "<li><strong>Google (Firebase)</strong>: sign-in and storing the planner data of signed-in users.</li>",
      "<li><strong>Google Analytics</strong>: usage statistics, only if you agree.</li>",
      "<li><strong>Cloudflare</strong>: hosts the website, protects it from attacks, counts visits without cookies (Web Analytics) and forwards email sent to Solo Supper addresses.</li>",
      "<li><strong>Resend</strong>: sends email from Solo Supper addresses.</li>",
      "<li><strong>Kit</strong>: sends the weekly email, only if you sign up for it.</li>",
      "<li><strong>Stripe and Onelink</strong> and <strong>Google Play</strong>: payments for Pro.</li>",
      "</ul>",
      "<p>Some of these services store data outside the UK, including in the United States. Where that happens, the transfer is covered by UK-approved safeguards such as the UK Extension to the EU-US Data Privacy Framework or standard contractual clauses.</p>",

      "<h2>How long it is kept</h2>",
      "<ul>",
      "<li>Planner data in your account: until you ask for your account to be deleted.</li>",
      "<li>The weekly email list: until you unsubscribe, then only a record that you did, so you aren't emailed again.</li>",
      "<li>Payment records: six years, as UK tax law requires.</li>",
      "<li>Usage statistics: no longer than 14 months.</li>",
      "<li>Emails: as long as needed to deal with your question, and no longer than two years.</li>",
      "</ul>",

      "<h2>Deleting your account</h2>",
      "<p>In the planner, open Settings and choose Delete account. That deletes your account and everything stored with it straight away, and cancels any subscription. You can also email <a href=\"mailto:{EMAIL}\">{EMAIL}</a> from the address you sign in with and I will do it within 30 days. Data kept only on your device can be removed by clearing your browser's site data or uninstalling the app.</p>",

      "<h2>Your rights</h2>",
      "<p>Under UK data protection law you can ask for a copy of your information, ask me to correct or delete it, object to or restrict how it is used, ask for it in a portable format, and withdraw consent at any time. Email <a href=\"mailto:{EMAIL}\">{EMAIL}</a> and I will reply within a month.</p>",
      "<p>If you are unhappy with how your information has been handled, you can complain to the Information Commissioner's Office at <a href=\"https://ico.org.uk/make-a-complaint/\">ico.org.uk</a>.</p>",

      "<h2>Children</h2>",
      "<p>Solo Supper is meant for adults and is not aimed at children under 13.</p>",

      "<h2>Changes</h2>",
      "<p>If this policy changes, the new version will appear here with a new date. If a change affects how your information is used in a significant way, signed-in users will be told before it takes effect.</p>",
      "<p class=\"legal-updated\">Last updated " + UPDATED + ".</p>"
    ].join("\n")
  },

  {
    slug: "terms",
    title: "Terms of use",
    description: "The terms for using Solo Supper, including Pro subscriptions, free trials and gift codes.",
    html: [
      "<p>These terms apply when you use the Solo Supper website at {SITE} or the Solo Supper app. Solo Supper is run by Neil Fletcher, a sole trader based in England (\"I\", \"me\"). You can contact me at <a href=\"mailto:{EMAIL}\">{EMAIL}</a>.</p>",
      "<p>By using Solo Supper you agree to these terms. If you do not agree, please do not use it.</p>",

      "<h2>Using Solo Supper</h2>",
      "<p>The recipes and the planner are free to use. You may use them for your own cooking at home. Please do not copy the recipes, photos or code to publish elsewhere, scrape the site, or try to break or overload it.</p>",

      "<h2>Recipes, allergens and food safety</h2>",
      "<p>The recipes are written with care, but you are responsible for what you cook and eat. Always check ingredient labels for allergens, cook meat, fish and eggs thoroughly, and follow the storage advice on packs. Allergy and dislike filters are there to help, not to guarantee that a recipe is safe for you. Cooking times, amounts and pack sizes are guides and may differ from what you buy.</p>",

      "<h2>Your account</h2>",
      "<p>You can use Solo Supper without an account. If you sign in, keep access to your Google account or email address secure, as that is what protects your Solo Supper account. I may suspend an account that is used to abuse the service.</p>",

      "<h2>Solo Supper Pro</h2>",
      "<h3>Subscriptions</h3>",
      "<p>Pro adds planning features on top of the free recipes. The price, what is included and how often you are billed are shown before you buy. On the website, Pro is sold through Stripe's Managed Payments, and Onelink (part of Stripe) is the merchant of record, so your purchase is also covered by the Onelink terms shown at checkout. In the Android app, Pro is sold through Google Play under Google Play's terms.</p>",
      "<p>Subscriptions renew automatically at the end of each period until you cancel.</p>",

      "<h3>Cancelling</h3>",
      "<p>You can cancel at any time from Settings, then Manage subscription, in the planner, or from your Onelink account (or from Google Play subscriptions in the app). Pro then stays on until the end of the period you have paid for and does not renew.</p>",

      "<h3>Free trial</h3>",
      "<p>New accounts may get a free Pro trial. No card is needed, and when the trial ends your account returns to the free version unless you choose to subscribe. One trial per person.</p>",

      "<h3>Lifetime Pro</h3>",
      "<p>From time to time Pro is offered for a single payment instead of a subscription. Lifetime Pro lasts for as long as Solo Supper runs as a service, for the account it was bought with, and includes the four Solo Supper cookbook PDFs. If you already subscribe, buying lifetime Pro stops your subscription renewing; the period you have already paid for is not refunded automatically, but you can ask. If Solo Supper ever closes, lifetime Pro ends with it and you will be told at least 60 days before; your cookbook PDFs stay yours.</p>",

      "<h3>Gift codes</h3>",
      "<p>A gift code gives Pro for the period stated with the code. Each code can be used once, has no cash value and cannot be exchanged or resold.</p>",

      "<h3>Cooking rewards</h3>",
      "<p>Signed-in users who tick enough different dinners as cooked in the planner can choose a Solo Supper cookbook PDF free, one book for each milestone shown in Your kitchen. Rewards are for your own account, have no cash value and can't be exchanged. Dinners must be ticked over several days to count. Rewards may change or end for future milestones, but a book you have chosen stays yours.</p>",

      "<h3>Price changes</h3>",
      "<p>If the price of Pro changes, you will be told by email at least 30 days before it affects your next renewal, so you can cancel first if you wish.</p>",

      "<h3>Refunds</h3>",
      "<p>See the <a href=\"{REL}refunds/\">refund policy</a>. Nothing in these terms affects your statutory rights as a consumer.</p>",

      "<h2>Changes to Solo Supper</h2>",
      "<p>I keep improving Solo Supper, so features may change. If a change takes away something important that you have paid for, you can cancel and get a refund for the unused part of your subscription.</p>",

      "<h2>Liability</h2>",
      "<p>Solo Supper is provided with reasonable care and skill, but I cannot promise it will always be available or free of errors. I am not liable for losses that were not foreseeable, for business losses, or for anything beyond what you have paid me in the previous 12 months. Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot be limited by law.</p>",

      "<h2>Law</h2>",
      "<p>These terms are governed by the law of England and Wales. If you live in Scotland or Northern Ireland, you can also bring a claim in your local courts.</p>",

      "<h2>Changes to these terms</h2>",
      "<p>If these terms change, the new version will appear here with a new date. Significant changes affecting Pro subscribers will be emailed in advance.</p>",
      "<p class=\"legal-updated\">Last updated " + UPDATED + ".</p>"
    ].join("\n")
  },

  {
    slug: "refunds",
    title: "Refund policy",
    description: "How to get a refund for Solo Supper Pro: a full refund within 14 days of any payment, no questions asked.",
    html: [
      "<p>If Pro is not for you, you can have your money back.</p>",

      "<h2>14-day refunds</h2>",
      "<p>Email <a href=\"mailto:{EMAIL}\">{EMAIL}</a> within 14 days of any payment, whether your first or a renewal, and you will get a full refund for that payment, no questions asked. Please email from the address you signed up with, or include it. Pro is switched off when the refund is made.</p>",

      "<h2>Lifetime Pro</h2>",
      "<p>Lifetime Pro has the same 14-day full refund. Lifetime Pro, and the cookbook PDFs that come with it, are switched off when the refund is made.</p>",

      "<h2>After 14 days</h2>",
      "<p>After 14 days, payments are not normally refunded, but you can cancel at any time so your subscription does not renew. Pro stays on until the end of the period you have paid for. If something has gone wrong, such as being charged twice or Pro not working, email me and it will be put right.</p>",

      "<h2>Cookbook PDFs</h2>",
      "<p>The Solo Supper cookbook PDFs are digital downloads, ready straight after payment. By downloading one you agree that it is supplied straight away, and the 14-day right to cancel no longer applies to it. If a file won't open or something is wrong with it, email <a href=\"mailto:{EMAIL}\">{EMAIL}</a> and I will fix it or refund you. PDFs that come with a Pro subscription stay yours if you cancel; a refund of a subscription payment doesn't take them back.</p>",

      "<h2>How refunds are paid</h2>",
      "<p>Website purchases are refunded through Stripe (Onelink) to the card or account you paid with, usually within 5 to 10 working days. You can also ask Onelink's support team for a refund. Purchases made in the Android app are refunded through Google Play: you can request one from Google Play directly, or email me and I will help.</p>",

      "<h2>Your statutory rights</h2>",
      "<p>This policy is in addition to your rights under UK consumer law, including the Consumer Contracts Regulations and the Consumer Rights Act 2015. Nothing here affects those rights.</p>",
      "<p class=\"legal-updated\">Last updated " + UPDATED + ".</p>"
    ].join("\n")
  },

  {
    slug: "cookies",
    title: "Cookies and local storage",
    description: "The cookies and local storage Solo Supper uses, and how to change your choice.",
    html: [
      "<p>Solo Supper uses as little as it can. Usage statistics cookies are only set if you agree; everything else is needed for the site to work.</p>",
      "<p><a class=\"btn btn-outline\" href=\"#cookie-settings\">Change cookie settings</a></p>",

      "<h2>Needed for the site to work</h2>",
      "<p>These are always on. They do not track you.</p>",
      "<div class=\"legal-table\"><table>",
      "<thead><tr><th>Name</th><th>Type</th><th>What it does</th><th>How long</th></tr></thead>",
      "<tbody>",
      "<tr><td>soloSupper.state.v1</td><td>Local storage</td><td>Your planner: your week, shopping list, ratings and settings, kept on your device</td><td>Until you clear it</td></tr>",
      "<tr><td>soloSupper.analyticsConsent</td><td>Local storage</td><td>Remembers your answer to the cookie banner</td><td>Until you clear it</td></tr>",
      "<tr><td>soloSupper.unsynced</td><td>Local storage</td><td>Notes changes still waiting to sync to your account</td><td>Until you clear it</td></tr>",
      "<tr><td>firebaseLocalStorageDb</td><td>Browser database</td><td>Keeps you signed in, if you sign in</td><td>Until you sign out</td></tr>",
      "<tr><td>__cf_bm</td><td>Cookie</td><td>Set by Cloudflare, in some cases, to protect the site from bots</td><td>30 minutes</td></tr>",
      "</tbody></table></div>",

      "<h2>Usage statistics (only if you agree)</h2>",
      "<div class=\"legal-table\"><table>",
      "<thead><tr><th>Name</th><th>Type</th><th>What it does</th><th>How long</th></tr></thead>",
      "<tbody>",
      "<tr><td>_ga</td><td>Cookie</td><td>Google Analytics: tells visits apart so they can be counted</td><td>2 years</td></tr>",
      "<tr><td>_ga_JF54HQGVLT</td><td>Cookie</td><td>Google Analytics: keeps track of the current visit</td><td>2 years</td></tr>",
      "<tr><td>soloSupper.firstTouch</td><td>Local storage</td><td>How you first found Solo Supper and the page you arrived on, saved with your account if you create one</td><td>Until you clear it or say no</td></tr>",
      "</tbody></table></div>",
      "<p>If you say no, these are never set. If you said yes and change your mind, use <a href=\"#cookie-settings\">cookie settings</a>; you can also delete existing cookies in your browser settings.</p>",

      "<h2>More information</h2>",
      "<p>The <a href=\"{REL}privacy/\">privacy policy</a> explains what happens to your information. Questions to <a href=\"mailto:{EMAIL}\">{EMAIL}</a>.</p>",
      "<p class=\"legal-updated\">Last updated " + UPDATED + ".</p>"
    ].join("\n")
  }
];
