# AcogoFitness Web

This directory contains the Next.js application that powers the AcogoFitness prototype. It covers the streak celebration flow, fully functional log creation sheet, customizable dashboard widgets, explore discovery experience, and compact profile layout requested in the latest QA round.

## Getting Started

```bash
npm install
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000). The `New Log` button in the header opens the log sheet. Saving a workout or note log pushes the streak over the edge and automatically prompts you to share once you hit seven consecutive days.

## Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run start` - run the production build locally
- `npm run lint` - lint the project using Next.js defaults

## Project Structure

- `app/` - App Router routes and layouts
- `components/` - UI building blocks (dashboard, explore, profile, streak celebration, log sheet)
- `lib/` - client-side utilities such as the log context and sample data
- `public/` - static assets including the AcogoFitness logo

The UI uses Tailwind CSS with a brand palette based on lime, forest green, and purple.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
