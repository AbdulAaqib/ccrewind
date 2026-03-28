import { Metadata } from "next";
import { decodeShareData } from "@/lib/share";
import SharePageClient from "./SharePageClient";

interface Props {
  searchParams: Promise<{ d?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const data = params.d ? decodeShareData(params.d) : null;

  if (!data) {
    return {
      title: "CC Rewind — Your Claude Code Story",
      description: "Spotify Wrapped but for your Claude Code usage.",
    };
  }

  const title = `I'm ${data.name} — CC Rewind`;
  const description = `${data.oneLiner} CPS: ${data.cps}/1000. ${data.totalMessages.toLocaleString()} messages. ${data.endingLine}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?d=${params.d}`],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?d=${params.d}`],
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const params = await searchParams;
  return <SharePageClient encoded={params.d ?? null} />;
}
