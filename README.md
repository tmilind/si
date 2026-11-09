# SourceIntellect

Astro static site for sourceintellect.com.

- `npm run dev` - local dev server
- `npm run build` - build to `dist/`
- `npm test` - unit tests
- `npm run test:dist` - build, then test the built output
- `npm run deploy` - build and deploy to Firebase Hosting

## Contact form

The contact form posts to Web3Forms and needs `PUBLIC_WEB3FORMS_KEY`. Get a key at web3forms.com (created with the hello@sourceintellect.com mailbox), then put it in `.env` locally (see `.env.example`) and set it in the deploy environment. Without it the build warns and the form will not deliver.
