import { Apod } from "@/components/apod/apod";

export function meta() {
  return [
    { title: "APOD - Astronomy Picture of the Day" },
    { name: "description", content: "NASA's Astronomy Picture of the Day" },
  ];
}

export default function ApodPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Apod />
    </div>
  );
}
