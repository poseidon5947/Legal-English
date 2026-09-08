# MPC logo extraction

The website uses the image-generation extraction from the supplied reference image.

## Production assets

- `public/brand/mpc-logo-extracted.png` — transparent dark-text horizontal lockup
- `public/brand/mpc-logo-extracted-light.png` — transparent reversed lockup for dark surfaces
- `public/brand/mpc-icon-extracted.png` — transparent square MPC mark
- `public/brand/mpc-icon-192.png` and `mpc-icon-512.png` — manifest icons
- `public/brand/mpc-icon-maskable-512.png` — padded maskable app icon
- `app/icon.png` and `app/apple-icon.png` — browser and Apple icons

## Image-generation prompt

Built-in image generation was used in `background-extraction` mode:

> Precisely isolate and extract the complete logo artwork from the checkerboard background, including the purple rounded-square “mpc” icon, the black “Law Studio” title, and the gray “Legal English Training” subtitle. Retain the original horizontal lockup and proportions; tightly crop with a small even transparent margin. Preserve the original letterforms, spelling, relative alignment, colors, proportions, and glossy purple icon as faithfully as possible. Output a high-resolution PNG with genuine alpha transparency.

The light version was derived from the successful transparent extraction by changing only the title and subtitle colors. This avoided the checkerboard introduced by the second image-generation attempt and preserved the extracted shapes and alpha channel exactly.

## Verification

- Production build and TypeScript passed.
- All 10 project tests passed.
- Browser checks passed on the home, sign-in, and learner pages at 1440px, 390px, and 320px.
- No horizontal overflow, broken logo image, or browser exception was found.
