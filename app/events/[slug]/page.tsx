import BookEvent from '@/components/BookEvent';
import EventCard from '@/components/EventCard';
import IEvent, { IEvent } from '@/database/event.model';
import { getSimilarEventsBySlug } from '@/lib/actions/event.actions';
import Image from 'next/image';
import { notFound } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <section className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </section>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag, index) => (
      <div key={index} className="pill">
        {tag}
      </div>
    ))}
  </div>
);

const EventsDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_BASE_URL is not configured');
  }

  try {
    const request = await fetch(`${BASE_URL}/api/events/${slug}`);

    if (!request.ok) {
      if (request.status === 404) {
        return notFound();
      }
      throw new Error(`Failed to fetch event: ${request.status}`);
    }

    const data = await request.json();
    const event = data?.event;

    if (!event || !event.description) {
      return notFound();
    }

    const { description, image, overview, title, date, time, location, mode, agenda, organizer, tags, audience } = event;

    const bookings = 10;

    const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

    return (
      <section id="event">
        <div className="header">
          <h1>Event Description</h1>
          <p>{description}</p>
        </div>

        <div className="details">
          {/* Left Side - Event Content */}
          <div className="content">
            <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />

            <section className="flex-col-gap-2">
              <h2>Overview</h2>
              <p>{overview}</p>
            </section>

            <section className="flex-col-gap-2">
              <h2>Event Details</h2>

              <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
              <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
              <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
              <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
              <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
            </section>

            {Array.isArray(agenda) && agenda.length > 0 && <EventAgenda agendaItems={agenda} />}

            <section className="flex-col-gap-2">
              <h2>About the Organizer</h2>
              {organizer}
            </section>

            {Array.isArray(tags) && tags.length > 0 && <EventTags tags={tags} />}
          </div>

          {/* Right Side - Booking Form */}
          <aside className="booking">
            <div className="signup-card">
              <h2>Book your spot</h2>
              {bookings > 0 ? (
                <p className="text-sm ">Join {bookings} people who have already booked their spot!</p>
              ) : (
                <p className="text-sm ">Be the first to book your spot!</p>
              )}

              <BookEvent />
            </div>
          </aside>
        </div>

        <div className="flex w-full flex-col gap-4 pt-20">
          <h2>Similar Events</h2>
          <div className="events">
            {similarEvents.length > 0 && similarEvents.map((similarEvent: IEvent) => <EventCard key={similarEvent.slug} {...similarEvent} />)}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error loading event:', error);
    throw error; // Let Next.js error boundary handle it
  }
};

export default EventsDetailsPage;
