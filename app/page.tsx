import EvenCard from "@/components/EvenCard";
import ExploreBtn from "@/components/ExploreBtn";
import { events } from "@/lib/constants";
import { time } from "console";


export default function Page() {
  return (
    <section>
      <h1 className="text-center">The Hub for Every Dev<br /> Event You Can&apos;t Miss</h1>
      <p className="text-center mt-5">Hackatons, Meetups, and Conferences All in One Place</p>

      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Feature Events</h3>

        <ul className="events">
          {events.map((event) => (
            <li key={event.title}>

              <EvenCard {...event} />
            </li>
          ))}
        </ul>
      </div>

    </section>
  );
}
