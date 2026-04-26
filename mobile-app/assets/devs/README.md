# 📸 Developer Photos — How to Add

## Where to put photos

Put developer photos in this folder (`mobile-app/assets/devs/`) with **these exact names**:

- `vishal.jpg` → Vishal Kumar's photo
- `ayush.jpg` → Ayush Kumar's photo

## Image requirements

- **Format:** JPG or PNG (JPG recommended)
- **Size:** 500x500px minimum, square crop is best (app will show rounded-square)
- **File size:** < 500 KB each (for fast app loading)

## How to change in the app

1. Save the photos in this folder with names above
2. Open `mobile-app/app/about.js`
3. The photos are already referenced — just replace the files and restart Expo

If you want to use different filenames, update the `image` field in `about.js`:

```js
const developers = [
  {
    name: 'Vishal Kumar',
    image: require('../assets/devs/vishal.jpg'),  // ← change filename here
    ...
  },
];
```

## Cropping tip

Use any tool (Photoshop / Figma / Canva / online cropper) to crop photos to
a perfect square before saving. The app will add rounded corners automatically.
