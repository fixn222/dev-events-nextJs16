import BookEvents from '@/components/BookEvents';
import EventCard from '@/components/EventCard';
import { IEvent } from '@/database';
import { getSimilarEventsBySlug } from '@/lib/actions/events.actions';
import { sign } from 'crypto';
import { cacheLife } from 'next/cache';
// import next from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const bookings = 10;


const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string; }) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
)

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className='agenda'>
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
)

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>{tag}</div>
    ))}
  </div>
)
const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  
  // 'use cache'
  // cacheLife('hours');
  
  const { slug } = await params;
  let event;

  try {

    const request = await fetch(`${BASE_URL}/api/events/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!request.ok) {

      if (request.status === 404) {
        return notFound();

      }

      throw new Error(`Failed to fetch an event : ${request.statusText}`);

    }

    const response = await request.json();

    event = response.event;

    if (!event) return notFound();



  } catch (error) {

    console.error("error fetching event" , error);

    return notFound();

  }



    const { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } = event;

    if(!description) return notFound();

    const similerEvents : IEvent[] = await getSimilarEventsBySlug(slug);





  return (
    <section id='event'>
      <div className='header'>
        <h1>Event Description</h1>
        <p className='mt-2'>{description}</p>

      </div>

      <div className='details'>
        {/* left-side  */}

        <div className='content'>
          <Image src={image} alt='img' width={800} height={800} className='banner' />
          <section className='flex-col-gap-2'>
            <h2 >Overview</h2>
            <p>{overview}</p>
          </section>

          <section className='flex-col-gap-2' >
            <h2>Event Details</h2>
            <EventDetailItem icon='/icons/calendar.svg' alt='calendar' label={date} />
            <EventDetailItem icon='/icons/clock.svg' alt='calendar' label={time} />
            <EventDetailItem icon='/icons/pin.svg' alt='calendar' label={location} />
            <EventDetailItem icon='/icons/mode.svg' alt='calendar' label={mode} />
            <EventDetailItem icon='/icons/audience.svg' alt='calendar' label={audience} />
          </section>

          <EventAgenda agendaItems={agenda} />

          <section className='flex-col-gap-2'>
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags} />

        </div>

        {/* right-side */}
        <aside className='booking'>
          <div className="signup-card">
            <h2>Book your spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have already booked thier spot!
              </p>
            ) : (
              <p className="text-sm">Be first to book your spot!</p>
            )}
            <BookEvents eventId={event._id} slug={event.slug}   />
          </div>
        </aside>
      </div>
  <div className=" mt-20 w-full  gap-4 pt-20">
                <h2 >Similar Events</h2>
                <div className="events">
                    {similerEvents.length > 0 && similerEvents.map((similerEvent: IEvent) => (
                        <EventCard key={similerEvent.title} {...similerEvent} />
                    ))}
                </div>
            </div>
    </section>
  )

}

export default EventDetailsPage