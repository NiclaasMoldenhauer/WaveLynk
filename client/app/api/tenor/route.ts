import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");
  const query = Object.fromEntries(searchParams.entries());
  delete query.endpoint;

  if (!endpoint) {
    return NextResponse.json(
      { error: "No endpoint specified" },
      { status: 400 }
    );
  }

  try {
    let url = `https://tenor.googleapis.com/v2/${endpoint}`;
    if (endpoint === "trending") {
      url = "https://tenor.googleapis.com/v2/featured";
    }

    const response = await axios.get(url, {
      params: {
        ...query,
        key: process.env.TENOR_API_KEY,
        client_key: "WaveLynk",
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error proxying request to Tenor:", error);
    return NextResponse.json(
      { error: "Error fetching data from Tenor API" },
      { status: 500 }
    );
  }
}
