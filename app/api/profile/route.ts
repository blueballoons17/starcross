import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { calculateAstrologyProfile } from "@/lib/astrology";
import { sendWelcomeEmail } from "@/lib/email";

interface SessionUser {
  id?: string;
  email?: string | null;
  name?: string | null;
}

async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as SessionUser).id ?? null;
}

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  const astrologyProfileRaw = await prisma.astrologyProfile.findUnique({
    where: { userId },
  });

  // Parse JSON strings stored for SQLite
  const astrologyProfile = astrologyProfileRaw
    ? {
        ...astrologyProfileRaw,
        elementScores: typeof astrologyProfileRaw.elementScores === "string"
          ? JSON.parse(astrologyProfileRaw.elementScores)
          : astrologyProfileRaw.elementScores,
        modalScores: typeof astrologyProfileRaw.modalScores === "string"
          ? JSON.parse(astrologyProfileRaw.modalScores)
          : astrologyProfileRaw.modalScores,
        traits: typeof astrologyProfileRaw.traits === "string"
          ? JSON.parse(astrologyProfileRaw.traits)
          : astrologyProfileRaw.traits,
      }
    : null;

  return NextResponse.json({ profile, astrologyProfile });
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    name?: string;
    birthDate?: string;
    birthTime?: string;
    birthCity?: string;
    birthCountry?: string;
    gender?: string;
    prefGenders?: string | string[];
    prefAgeMin?: number;
    prefAgeMax?: number;
    bio?: string;
    avatarUrl?: string;
    interests?: string;
    photos?: string;
    answers?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    name,
    birthDate,
    birthTime,
    birthCity,
    birthCountry,
    gender,
    prefGenders,
    prefAgeMin,
    prefAgeMax,
    bio,
    avatarUrl,
    interests,
    photos,
    answers,
  } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!birthDate) {
    return NextResponse.json({ error: "Birth date is required." }, { status: 400 });
  }
  if (!birthCity?.trim()) {
    return NextResponse.json({ error: "Birth city is required." }, { status: 400 });
  }
  if (!birthCountry?.trim()) {
    return NextResponse.json({ error: "Birth country is required." }, { status: 400 });
  }

  const birthDateObj = new Date(birthDate);
  if (isNaN(birthDateObj.getTime())) {
    return NextResponse.json({ error: "Invalid birth date." }, { status: 400 });
  }

  // Normalize prefGenders to a comma-separated string for SQLite
  let prefGendersStr = "any";
  if (prefGenders) {
    if (Array.isArray(prefGenders)) {
      prefGendersStr = prefGenders.join(",") || "any";
    } else {
      prefGendersStr = prefGenders || "any";
    }
  }

  // Calculate astrology profile
  const astroResult = calculateAstrologyProfile(
    birthDateObj,
    birthTime || undefined,
    birthCity
  );

  // Check if this is the first time the profile is being created
  const existingProfile = await prisma.profile.findUnique({
    where: { userId },
    select: { userId: true },
  });
  const isNewProfile = !existingProfile;

  // Upsert profile
  const profile = await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      name: name.trim(),
      birthDate: birthDateObj,
      birthTime: birthTime || null,
      birthCity: birthCity.trim(),
      birthCountry: birthCountry.trim(),
      gender: gender || null,
      prefGenders: prefGendersStr,
      prefAgeMin: prefAgeMin ?? 18,
      prefAgeMax: prefAgeMax ?? 45,
      bio: bio || null,
      avatarUrl: avatarUrl ?? null,
      interests: interests ?? null,
      photos: photos ?? null,
      answers: answers ?? null,
    },
    update: {
      name: name.trim(),
      birthDate: birthDateObj,
      birthTime: birthTime || null,
      birthCity: birthCity.trim(),
      birthCountry: birthCountry.trim(),
      gender: gender || null,
      prefGenders: prefGendersStr,
      prefAgeMin: prefAgeMin ?? 18,
      prefAgeMax: prefAgeMax ?? 45,
      bio: bio || null,
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(interests !== undefined && { interests }),
      ...(photos !== undefined && { photos }),
      ...(answers !== undefined && { answers }),
    },
  });

  // Upsert astrology profile — store JSON as strings for SQLite
  const astrologyProfileRaw = await prisma.astrologyProfile.upsert({
    where: { userId },
    create: {
      userId,
      sunSign: astroResult.signs.sun,
      moonSign: astroResult.signs.moon,
      risingSign: astroResult.signs.rising,
      elementScores: JSON.stringify(astroResult.elements),
      modalScores: JSON.stringify(astroResult.modals),
      traits: JSON.stringify(astroResult.traits),
    },
    update: {
      sunSign: astroResult.signs.sun,
      moonSign: astroResult.signs.moon,
      risingSign: astroResult.signs.rising,
      elementScores: JSON.stringify(astroResult.elements),
      modalScores: JSON.stringify(astroResult.modals),
      traits: JSON.stringify(astroResult.traits),
    },
  });

  const astrologyProfile = {
    ...astrologyProfileRaw,
    elementScores: astroResult.elements,
    modalScores: astroResult.modals,
    traits: astroResult.traits,
  };

  // Send welcome email with real name on first profile creation
  if (isNewProfile) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, referralCode: true },
    });
    if (user) {
      sendWelcomeEmail(user.email, name?.trim(), user.referralCode ?? undefined).catch(() => {});
    }
  }

  return NextResponse.json({ profile, astrologyProfile });
}
