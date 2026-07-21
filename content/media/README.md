# content/media/

Drop per-slot artwork here **only if you prefer repo-committed images** over
the Google-Drive workflow. A deck spec then references it as:

```js
cover: { image: 'content/media/my-artwork.png', imagePos: '50% 45%' }
```

Most slots pull artwork from Google Drive instead (Cowork downloads it per
run) — see `STUDIO_COWORK.md`. Recurring brand assets (logo, headshots,
textures) already live in `client/public/` and need no copy here.

Keep this folder light — it is not the media library, just an optional
in-repo drop for images you want version-controlled with a specific deck.
