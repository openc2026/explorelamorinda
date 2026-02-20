# Explore Lamorinda

A comprehensive guide to Lafayette, Moraga, and Orinda.

## Development

### Prerequisites
- [Hugo](https://gohugo.io/installation/) (extended version)

### Local Development
```bash
hugo server -D
```
Then open http://localhost:1313

### Build for Production
```bash
hugo
```
Output goes to `public/`

## Content Structure

```
content/
├── _index.md              # Homepage
├── lafayette/
│   ├── _index.md          # Lafayette main page
│   ├── restaurants/       # Restaurant listings
│   ├── shops/             # Shop listings
│   └── neighborhoods/     # Neighborhood guides
├── moraga/
├── orinda/
├── getting-around/
├── things-to-do/
├── real-estate/
└── about.md
```

## Adding Content

### New Restaurant
```bash
hugo new lafayette/restaurants/my-restaurant.md
```

Then edit the file with:
```yaml
---
title: "Restaurant Name"
description: "Brief description"
address: "123 Main St, Lafayette, CA"
phone: "(925) 555-1234"
website: "https://example.com"
hours: "Mon-Sat 11am-9pm"
tags: ["italian", "downtown", "date-night"]
---

Your content here...
```

## Deployment

This site deploys to Cloudflare Pages automatically when you push to `main`.
