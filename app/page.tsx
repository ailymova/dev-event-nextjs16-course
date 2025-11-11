import EventCard from '@/components/EventCard';
import ExploreBtn from '@/components/ExploreBtn';
import { IEvent } from '@/database';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_BASE_URL environment variable is not configured');
}
const Page = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/events`, {
      next: { revalidate: 3600 }, // Optional: add revalidation strategy
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    const data = await response.json();
    const events = data?.events || [];

    return (
      <section>
        <h1 className="text-center">
          The Hub for Every Dev
          <br /> Event You Can&apos;t Miss
        </h1>
        <p className="text-center mt-5">Hackatons, Meetups, and Conferences All in One Place</p>

        <ExploreBtn />

        <div className="mt-20 space-y-7">
          <h3>Feature Events</h3>

          <ul className="events">
            {events &&
              events.length > 0 &&
              events.map((event: IEvent) => (
                <li key={event.slug} className="list-none">
                  <EventCard {...event} />
                </li>
              ))}
          </ul>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error loading events:', error);
    // Consider returning error UI instead of crashing
    return <div>Failed to load events. Please try again later.</div>;
  }
};

export default Page;
