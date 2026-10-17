#!/usr/bin/env node
// Assembles the site's *.html pages (at the repo root) from lean sources in
// src/pages/*.html + src/partials/layout.html.
// Output is plain static HTML — GitHub Pages serves it with zero server-side processing.
// Do not hand-edit the generated root *.html files — edit src/pages/ or
// src/partials/layout.html and rerun `npm run build:html`.
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');
const LAYOUT_PATH = path.join(ROOT, 'src', 'partials', 'layout.html');
const OUT_DIR = ROOT;

const ASSET_BASE = '';
const SITE_ORIGIN = 'https://kieranfraser.ie';

// Pre-redesign / unrelated pages at the repo root that the orphan-cleanup
// below must never touch, even though they have no matching src/pages file.
const PRESERVE = new Set(['ar-test.html', 'emulator.html', 'index_original.html', 'empushy.html', 'design_example.html']);

const PERSON_JSONLD = `{
		"@context": "https://schema.org",
		"@type": "Person",
		"name": "Kieran Fraser",
		"jobTitle": "Staff Machine Learning Engineer",
		"worksFor": {
			"@type": "Organization",
			"name": "PayPal"
		},
		"alumniOf": {
			"@type": "CollegeOrUniversity",
			"name": "Trinity College Dublin"
		},
		"address": {
			"@type": "PostalAddress",
			"addressRegion": "Wicklow",
			"addressCountry": "IE"
		},
		"url": "${SITE_ORIGIN}/",
		"image": "${SITE_ORIGIN}/images/me_cartoon.png",
		"sameAs": [
			"https://github.com/kieranfraser",
			"https://ie.linkedin.com/in/kieran-fraser-phd-608a54a7",
			"https://scholar.google.com/citations?user=9v_YcyIAAAAJ&hl=en",
			"https://patents.google.com/?inventor=Kieran+Fraser"
		]
	}`;

const NAV_SECTIONS = [
	{ key: 'work', label: 'Work', href: 'work.html' },
	{ key: 'lab', label: 'Lab', href: 'lab.html' },
	{ key: 'elsewhere', label: 'Elsewhere', href: 'elsewhere.html' },
	{ key: 'about', label: 'About', href: 'about.html' },
	{ key: 'cv', label: 'CV', href: 'cv.html' },
];

function activeSectionFor(filename) {
	if (filename === 'index.html') return 'index';
	const stem = filename.replace(/\.html$/, '');
	const section = NAV_SECTIONS.find(s => s.key !== 'index' && (stem === s.key || stem.startsWith(s.key + '-')));
	if (!section) throw new Error(`Cannot determine nav section for ${filename}`);
	return section.key;
}

function ogTypeFor(filename, activeKey) {
	if (filename === 'about.html') return 'profile';
	const isHub = filename === `${activeKey}.html`;
	return isHub ? 'website' : 'article';
}

function canonicalFor(filename) {
	return filename === 'index.html' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/${filename}`;
}

function buildNavLinks(activeKey) {
	return NAV_SECTIONS.map(s => {
		const current = s.key === activeKey ? ' aria-current="page"' : '';
		return `\t\t\t<a href="${s.href}"${current}>${s.label}</a>`;
	}).join('\n');
}

function buildMobileNavLinks(activeKey) {
	return NAV_SECTIONS
		.filter(s => s.key !== activeKey)
		.map(s => `\t\t<a href="${s.href}">${s.label}</a>`)
		.join('\n');
}

function parseSource(raw, filename) {
	const metaMatch = raw.match(/<!--meta\r?\n([\s\S]*?)\r?\n-->/);
	if (!metaMatch) throw new Error(`${filename}: missing <!--meta--> block`);
	const meta = {};
	for (const line of metaMatch[1].split(/\r?\n/)) {
		const m = line.match(/^(\w+):\s*(.*)$/);
		if (m) meta[m[1]] = m[2].trim();
	}
	if (!meta.title || !meta.description) throw new Error(`${filename}: meta block needs title + description`);

	const headExtraMatch = raw.match(/<!--head-extra\r?\n([\s\S]*?)\r?\n-->/);
	const headExtra = headExtraMatch ? headExtraMatch[1] : '';

	const bodyPreMatch = raw.match(/<!--body-pre\r?\n([\s\S]*?)\r?\n-->/);
	const bodyPre = bodyPreMatch ? bodyPreMatch[1] : '';

	const mainMatch = raw.match(/<main id="main">[\s\S]*<\/main>/);
	if (!mainMatch) throw new Error(`${filename}: missing <main id="main">...</main>`);

	return { title: meta.title, description: meta.description, headExtra, bodyPre, mainContent: mainMatch[0] };
}

function indent(block, prefix) {
	if (!block.trim()) return '';
	return block.split('\n').map(line => line.trim() ? prefix + line : line).join('\n') + '\n';
}

function build() {
	const layout = fs.readFileSync(LAYOUT_PATH, 'utf8');
	const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.html')).sort();

	if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

	// Remove previously-generated pages whose source no longer exists in
	// src/pages (e.g. a page was deleted) — everything else at the repo root
	// (llms.txt, sitemap.xml, robots.txt, assets/, images/, PRESERVE-listed
	// pages) is hand-maintained or unrelated and left alone.
	const expected = new Set(files);
	const orphaned = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.html') && !expected.has(f) && !PRESERVE.has(f));
	for (const filename of orphaned) {
		fs.unlinkSync(path.join(OUT_DIR, filename));
		console.log(`Removed orphaned ${path.relative(ROOT, path.join(OUT_DIR, filename))} (no matching source in src/pages)`);
	}

	for (const filename of files) {
		const raw = fs.readFileSync(path.join(PAGES_DIR, filename), 'utf8');
		const page = parseSource(raw, filename);
		const activeKey = activeSectionFor(filename);

		const html = layout
			.replace(/{{TITLE}}/g, () => page.title)
			.replace(/{{DESCRIPTION}}/g, () => page.description)
			.replace(/{{CANONICAL}}/g, () => canonicalFor(filename))
			.replace(/{{OG_TYPE}}/g, () => ogTypeFor(filename, activeKey))
			.replace(/{{SITE_ORIGIN}}/g, () => SITE_ORIGIN)
			.replace(/{{PERSON_JSONLD}}/g, () => PERSON_JSONLD)
			.replace(/{{ASSET_BASE}}/g, () => ASSET_BASE)
			.replace('{{HEAD_EXTRA}}', () => indent(page.headExtra, '\t'))
			.replace('{{BODY_PRE}}', () => indent(page.bodyPre, '\t'))
			.replace('{{NAV_LINKS}}', () => buildNavLinks(activeKey))
			.replace('{{MOBILE_NAV_LINKS}}', () => buildMobileNavLinks(activeKey))
			.replace('{{MAIN_CONTENT}}', () => indent(page.mainContent, '\t'));

		fs.writeFileSync(path.join(OUT_DIR, filename), html);
	}

	console.log(`Built ${files.length} pages into ${path.relative(ROOT, OUT_DIR)}/`);
}

build();
