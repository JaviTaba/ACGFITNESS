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
