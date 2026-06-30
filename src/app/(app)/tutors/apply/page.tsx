"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TutorApplyPage() {
  const router = useRouter();
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState(1500);
  const [courseInput, setCourseInput] = useState("");
  const [courses, setCourses] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  const DAYS = [
    { value: "mon", label: "Monday" },
    { value: "tue", label: "Tuesday" },
    { value: "wed", label: "Wednesday" },
    { value: "thu", label: "Thursday" },
    { value: "fri", label: "Friday" },
    { value: "sat", label: "Saturday" },
    { value: "sun", label: "Sunday" },
  ];

  function toggleDay(day: string) {
    const newAvail = { ...availability };
    if (newAvail[day]) {
      delete newAvail[day];
    } else {
      newAvail[day] = ["9:00 AM - 5:00 PM"];
    }
    setAvailability(newAvail);
  }

  function updateTimeSlot(day: string, slot: string) {
    const newAvail = { ...availability };
    newAvail[day] = [slot];
    setAvailability(newAvail);
  }

  function addCourse() {
    const code = courseInput.trim().toUpperCase();
    if (code && !courses.includes(code)) {
      setCourses([...courses, code]);
    }
    setCourseInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (courses.length === 0) {
      setError("Add at least one course code you can tutor.");
      return;
    }
    setLoading(true);

    try {
      let avatarUrl = undefined;
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("files", imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        if (!uploadRes.ok) {
          setError("Failed to upload profile picture");
          setLoading(false);
          return;
        }
        const uploadJson = await uploadRes.json();
        avatarUrl = uploadJson.urls[0];
      }

      const res = await fetch("/api/tutors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          bio,
          hourlyRate,
          expertiseAreas: courses,
          availability,
          avatarUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
      toast.success("Application submitted! We'll review it shortly.");
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/tutors" className="inline-flex items-center gap-1.5 text-sm font-medium text-warmgray-500 hover:text-violet-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to tutors
      </Link>

      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink">Apply to become a tutor</h1>
      <p className="mt-1 text-sm text-warmgray-500">An administrator reviews every application before your profile goes live.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5 rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-6 shadow-[var(--shadow-soft)]">
        <div>
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} required minLength={5} placeholder="MAT201/MAT202 & general calculus tutor" className="mt-1.5" />
        </div>

        <div>
          <Label htmlFor="picture">Profile Picture</Label>
          <Input 
            id="picture" 
            type="file" 
            accept="image/*" 
            onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
            className="mt-1.5 cursor-pointer" 
          />
        </div>

        <div>
          <Label htmlFor="courses">Course codes you can tutor</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              id="courses"
              value={courseInput}
              onChange={(e) => setCourseInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCourse();
                }
              }}
              placeholder="MAT201"
            />
            <Button type="button" variant="outline" onClick={addCourse}>Add</Button>
          </div>
          {courses.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {courses.map((c) => (
                <span key={c} className="flex items-center gap-1 rounded-md bg-violet-100 px-2 py-1 font-mono-code text-xs font-medium text-violet-700">
                  {c}
                  <button type="button" onClick={() => setCourses(courses.filter((x) => x !== c))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="bio">About you</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} required minLength={20} maxLength={1000} rows={5} placeholder="Your background, teaching style, and why students should book you…" className="mt-1.5" />
        </div>

        <div>
          <Label htmlFor="hourlyRate">Hourly rate (₦)</Label>
          <Input id="hourlyRate" type="number" min={100} step={100} value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} required className="mt-1.5" />
        </div>

        <div>
          <Label>Availability (Optional)</Label>
          <div className="mt-2 flex flex-col gap-2">
            {DAYS.map(day => (
              <div key={day.value} className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-ink w-32 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!availability[day.value]}
                    onChange={() => toggleDay(day.value)}
                    className="rounded border-warmgray-300 text-violet-600 focus:ring-violet-600 h-4 w-4"
                  />
                  {day.label}
                </label>
                {availability[day.value] && (
                  <Input 
                    value={availability[day.value][0]}
                    onChange={(e) => updateTimeSlot(day.value, e.target.value)}
                    placeholder="e.g. 10:00 AM - 2:00 PM"
                    className="h-8 text-sm flex-1 max-w-[200px]"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit application
        </Button>
      </form>
    </div>
  );
}
