"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ArrowLeft, Star, ShieldCheck, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

interface TutorDetail {
  tutor: {
    id: string;
    headline: string;
    bio: string;
    expertiseAreas: string;
    hourlyRate: number;
    avgRating: number;
    ratingCount: number;
    totalSessions: number;
    availability: string;
  };
  user: { id: string; name: string; department: string | null; verificationStatus: string; avatarUrl: string | null } | null;
  recentRatings: { score: number; comment: string | null }[];
}

const DAY_LABELS: Record<string, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday",
};

export default function TutorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const { data: session } = useSession();
  const router = useRouter();

  const [data, setData] = useState<TutorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookOpen, setBookOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(60);

  useEffect(() => {
    fetch(`/api/tutors/${id}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  async function submitBooking() {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setBooking(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorProfileId: id, courseCode, scheduledAt, durationMinutes: duration }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.error ?? "Could not create booking");
        setBooking(false);
        return;
      }
      toast.success("Booking requested! Pay now to confirm.");
      router.push(`/dashboard/orders?bookingCheckout=${d.booking.id}`);
    } catch {
      toast.error("Something went wrong");
      setBooking(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/tutors/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Could not delete profile");
        setDeleting(false);
        return;
      }
      toast.success("Tutor profile deleted");
      router.push("/tutors");
    } catch {
      toast.error("Something went wrong");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-warmgray-500">This tutor profile couldn't be found.</p>
        <Link href="/tutors" className="mt-3 inline-block text-sm font-medium text-violet-700 hover:underline">Back to tutors</Link>
      </div>
    );
  }

  const { tutor, user, recentRatings } = data;
  const expertise: string[] = JSON.parse(tutor.expertiseAreas || "[]");
  const availability: Record<string, string[]> = JSON.parse(tutor.availability || "{}");
  const isOwner = session?.user?.id === user.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/tutors" className="inline-flex items-center gap-1.5 text-sm font-medium text-warmgray-500 hover:text-violet-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to tutors
      </Link>

      <div className="mt-5 rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />}
              <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-display text-xl font-semibold text-ink">{user.name}</h1>
              <p className="text-sm text-warmgray-500">{user.department}</p>
              <div className="mt-1.5 flex items-center gap-2">
                {user.verificationStatus === "verified" && (
                  <Badge variant="emerald"><ShieldCheck className="h-3 w-3" /> Verified</Badge>
                )}
                <Badge variant="gold"><Star className="h-3 w-3 fill-current" /> {tutor.avgRating.toFixed(1)} ({tutor.ratingCount})</Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-semibold text-violet-700">₦{tutor.hourlyRate.toLocaleString()}</p>
            <p className="text-xs text-warmgray-400">per hour</p>
          </div>
        </div>

        <p className="mt-5 text-sm font-medium text-ink">{tutor.headline}</p>
        <p className="mt-2 text-sm leading-relaxed text-warmgray-600">{tutor.bio}</p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {expertise.map((e) => (
            <span key={e} className="rounded-md bg-violet-100 px-2 py-1 font-mono-code text-xs font-medium text-violet-700">{e}</span>
          ))}
        </div>

        <div className="mt-6 grid gap-5 border-t border-warmgray-100 pt-5 sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-warmgray-400">
              <Clock className="h-3.5 w-3.5" /> Availability
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-warmgray-600">
              {Object.entries(availability).map(([day, slots]) => (
                <li key={day}>
                  <span className="font-medium text-ink">{DAY_LABELS[day] ?? day}:</span> {slots.join(", ")}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-warmgray-400">Stats</p>
            <p className="mt-2 text-sm text-warmgray-600">{tutor.totalSessions} sessions taught</p>
          </div>
        </div>

        {isOwner ? (
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href={`/tutors/${tutor.id}/edit`}>Edit Profile</Link>
            </Button>
            <Button variant="danger" className="flex-1" onClick={() => setDeleteOpen(true)}>
              Delete Profile
            </Button>
          </div>
        ) : (
          <Button onClick={() => setBookOpen(true)} className="mt-6 w-full sm:w-auto">Book a session</Button>
        )}
      </div>

      {recentRatings.length > 0 && (
        <div className="mt-6 rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-base font-semibold text-ink">Student feedback</h2>
          <div className="mt-3 flex flex-col gap-3">
            {recentRatings.map((r, i) => (
              <div key={i} className="rounded-xl bg-warmgray-50 p-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className={`h-3.5 w-3.5 ${si < r.score ? "fill-gold-400 text-gold-400" : "text-warmgray-200"}`} />
                  ))}
                </div>
                {r.comment && <p className="mt-1.5 text-sm text-warmgray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book a session with {user.name}</DialogTitle>
            <DialogDescription>You'll pay after requesting — the tutor confirms once payment clears.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="courseCode">Course code</Label>
              <Input id="courseCode" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="MAT201" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="scheduledAt">Date & time</Label>
              <Input id="scheduledAt" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" type="number" min={30} step={30} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-1.5" />
            </div>
            <p className="text-sm text-warmgray-500">
              Estimated cost: <span className="font-semibold text-ink">₦{Math.round((tutor.hourlyRate * duration) / 60).toLocaleString()}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookOpen(false)}>Cancel</Button>
            <Button onClick={submitBooking} disabled={booking || !courseCode || !scheduledAt}>
              {booking && <Loader2 className="h-4 w-4 animate-spin" />}
              Request booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tutor Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your tutor profile? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
