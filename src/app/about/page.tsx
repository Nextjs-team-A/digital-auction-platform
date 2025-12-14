import { Metadata } from 'next';
import AboutPage from './AboutPage';

// The metadata is important for SEO and page title
export const metadata: Metadata = {
    title: "About Us | Digital Auction Platform",
    description: "Learn about the mission, vision, and team behind the Digital Auction Platform.",
};

/**
 * About Us Page Route Component
 * This is the entry point for the /about route.
 */
export default function About() {
    return <AboutPage />;
}