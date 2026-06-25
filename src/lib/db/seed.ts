import "dotenv/config";
import bcrypt from "bcryptjs";
import { db, categories, users, listings, tutorProfiles, trustScores, knowledgeBaseDocuments, bookings, ratings, userInteractions } from "@/lib/db";

async function main() {
  console.log("Seeding FUTMINNA AI database...");

  // ---------- Categories ----------
  const categoryData = [
    { name: "Textbooks", slug: "textbooks", icon: "book", description: "Course textbooks, handouts and past questions", sortOrder: 1 },
    { name: "Electronics", slug: "electronics", icon: "cpu", description: "Laptops, phones, calculators, accessories", sortOrder: 2 },
    { name: "Accommodation", slug: "accommodation", icon: "home", description: "Hostel rooms, lodge sublets, roommates", sortOrder: 3 },
    { name: "Services", slug: "services", icon: "wrench", description: "Typing, printing, laundry, errands", sortOrder: 4 },
    { name: "Food", slug: "food", icon: "utensils", description: "Home-cooked meals, snacks, bulk provisions", sortOrder: 5 },
    { name: "Fashion", slug: "fashion", icon: "shirt", description: "Clothing, shoes, accessories", sortOrder: 6 },
    { name: "Project Materials", slug: "project-materials", icon: "flask-conical", description: "Final year project components and kits", sortOrder: 7 },
    { name: "Miscellaneous", slug: "miscellaneous", icon: "package", description: "Everything else", sortOrder: 8 },
  ];

  const insertedCategories = await db.insert(categories).values(categoryData).returning();
  const catBySlug = Object.fromEntries(insertedCategories.map((c) => [c.slug, c]));
  console.log(`  ok ${insertedCategories.length} categories`);

  // ---------- Users ----------
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const demoUsers = [
    { name: "Admin User", email: "admin@futminna.edu.ng", role: "admin" as const, department: "Registry", level: "Staff", matricNumber: null, verificationStatus: "verified" as const },
    { name: "Hauwa Bello", email: "hauwa.bello@futminna.edu.ng", role: "student" as const, department: "Computer Science", level: "300", matricNumber: "2021/1/68421CS", verificationStatus: "verified" as const },
    { name: "Emeka Obi", email: "emeka.obi@futminna.edu.ng", role: "student" as const, department: "Mechanical Engineering", level: "400", matricNumber: "2020/1/52310ME", verificationStatus: "verified" as const },
    { name: "Fatima Yusuf", email: "fatima.yusuf@futminna.edu.ng", role: "tutor" as const, department: "Mathematics", level: "500", matricNumber: "2019/1/49002MT", verificationStatus: "verified" as const },
    { name: "Chidi Okafor", email: "chidi.okafor@futminna.edu.ng", role: "tutor" as const, department: "Computer Science", level: "Graduate Assistant", matricNumber: "2018/1/40117CS", verificationStatus: "verified" as const },
    { name: "Aisha Mohammed", email: "aisha.mohammed@futminna.edu.ng", role: "student" as const, department: "Physics", level: "200", matricNumber: "2022/1/71009PH", verificationStatus: "pending" as const },
    { name: "Tunde Adeyemi", email: "tunde.adeyemi@futminna.edu.ng", role: "tutor" as const, department: "Electrical Engineering", level: "Graduate Assistant", matricNumber: "2017/1/38812EE", verificationStatus: "verified" as const },
  ];

  const insertedUsers = await db
    .insert(users)
    .values(
      demoUsers.map((u) => ({
        name: u.name,
        email: u.email,
        passwordHash,
        matricNumber: u.matricNumber ?? undefined,
        department: u.department,
        level: u.level,
        role: u.role,
        emailVerified: true,
        verificationStatus: u.verificationStatus,
        walletBalance: u.role === "student" ? 5000 : 0,
      }))
    )
    .returning();

  await db.insert(trustScores).values(
    insertedUsers.map((u) => ({
      userId: u.id,
      score: u.verificationStatus === "verified" ? 72 : 48,
      verificationPoints: u.verificationStatus === "verified" ? 20 : 8,
      transactionPoints: 0,
      ratingPoints: 30,
      responsePoints: 10,
      disputePenalty: 0,
    }))
  );

  const byEmail = Object.fromEntries(insertedUsers.map((u) => [u.email, u]));
  console.log(`  ok ${insertedUsers.length} demo users (password: Password123!)`);

  // ---------- Listings ----------
  const listingData = [
    {
      sellerId: byEmail["hauwa.bello@futminna.edu.ng"].id,
      categoryId: catBySlug["textbooks"].id,
      title: "Engineering Mathematics by K.A. Stroud (5th Ed)",
      description: "Used for MAT201/MAT202. Good condition, all pages intact, minor highlighting in chapter 3. Great for the calculus-heavy modules.",
      price: 4500,
      condition: "used" as const,
      images: JSON.stringify([]),
      viewCount: 134,
      favoriteCount: 12,
    },
    {
      sellerId: byEmail["emeka.obi@futminna.edu.ng"].id,
      categoryId: catBySlug["electronics"].id,
      title: "HP ProBook 450 G5 — Core i5, 8GB RAM, 256GB SSD",
      description: "Reliable laptop for CAD, coding and project defense slides. Battery holds 3+ hours. Selling because I upgraded.",
      price: 185000,
      condition: "like_new" as const,
      images: JSON.stringify([]),
      viewCount: 312,
      favoriteCount: 28,
    },
    {
      sellerId: byEmail["aisha.mohammed@futminna.edu.ng"].id,
      categoryId: catBySlug["accommodation"].id,
      title: "Self-contained room sublet near Gidan Kwano gate",
      description: "Available for the next session, 5 mins walk to the school gate. Tiled floor, constant water supply, prepaid meter.",
      price: 120000,
      condition: "used" as const,
      images: JSON.stringify([]),
      location: "Gidan Kwano",
      viewCount: 201,
      favoriteCount: 19,
    },
    {
      sellerId: byEmail["chidi.okafor@futminna.edu.ng"].id,
      categoryId: catBySlug["project-materials"].id,
      title: "Arduino Uno R3 + sensor kit (final year project bundle)",
      description: "Includes ultrasonic, IR, DHT11, breadboard, jumper wires and a 9V battery pack. Used for one CPE final year project, fully functional.",
      price: 22000,
      condition: "used" as const,
      images: JSON.stringify([]),
      viewCount: 98,
      favoriteCount: 15,
    },
    {
      sellerId: byEmail["hauwa.bello@futminna.edu.ng"].id,
      categoryId: catBySlug["food"].id,
      title: "Weekly meal plan — jollof, fried rice & stew (5 packs)",
      description: "Home-style cooking, delivered to your hostel every weekday evening. Order by Sunday for the week.",
      price: 7500,
      condition: "new" as const,
      images: JSON.stringify([]),
      viewCount: 412,
      favoriteCount: 56,
    },
    {
      sellerId: byEmail["tunde.adeyemi@futminna.edu.ng"].id,
      categoryId: catBySlug["electronics"].id,
      title: "Casio FX-991EX Scientific Calculator",
      description: "Exam-approved, barely used. Comes with original case and manual.",
      price: 9000,
      condition: "like_new" as const,
      images: JSON.stringify([]),
      viewCount: 87,
      favoriteCount: 6,
    },
    {
      sellerId: byEmail["emeka.obi@futminna.edu.ng"].id,
      categoryId: catBySlug["services"].id,
      title: "Project report typing, formatting & binding",
      description: "Fast turnaround typing for project reports, SIWES reports and seminar papers. APA/IEEE formatting included. Spiral & hardcover binding available.",
      price: 3000,
      condition: "new" as const,
      images: JSON.stringify([]),
      viewCount: 156,
      favoriteCount: 22,
    },
    {
      sellerId: byEmail["aisha.mohammed@futminna.edu.ng"].id,
      categoryId: catBySlug["fashion"].id,
      title: "Lab coat, size M — barely worn",
      description: "Standard white lab coat for practicals, used for just one semester. Clean and well-kept.",
      price: 3500,
      condition: "used" as const,
      images: JSON.stringify([]),
      viewCount: 41,
      favoriteCount: 3,
    },
  ];

  const insertedListings = await db.insert(listings).values(listingData).returning();
  console.log(`  ok ${insertedListings.length} marketplace listings`);

  // ---------- Tutor profiles ----------
  const tutorData = [
    {
      userId: byEmail["fatima.yusuf@futminna.edu.ng"].id,
      headline: "MAT201/MAT202 & general calculus tutor",
      expertiseAreas: JSON.stringify(["MAT201", "MAT202", "MAT101", "MAT102"]),
      bio: "Final year Mathematics student with 3 years of peer tutoring experience. I focus on building intuition before formulas — most students who struggle with calculus just need it explained differently.",
      hourlyRate: 1500,
      availability: JSON.stringify({ mon: ["14:00-17:00"], wed: ["14:00-17:00"], sat: ["10:00-13:00"] }),
      status: "approved" as const,
      totalSessions: 64,
      totalEarnings: 96000,
      avgRating: 4.8,
      ratingCount: 41,
    },
    {
      userId: byEmail["chidi.okafor@futminna.edu.ng"].id,
      headline: "CSC301, CSC201 & intro programming (Python/C)",
      expertiseAreas: JSON.stringify(["CSC301", "CSC201", "CSC102", "CSC205"]),
      bio: "Graduate assistant in Computer Science. I teach data structures and algorithms with a hands-on, code-first approach — bring your laptop, we debug together.",
      hourlyRate: 2000,
      availability: JSON.stringify({ tue: ["16:00-19:00"], thu: ["16:00-19:00"], sun: ["13:00-16:00"] }),
      status: "approved" as const,
      totalSessions: 89,
      totalEarnings: 178000,
      avgRating: 4.9,
      ratingCount: 67,
    },
    {
      userId: byEmail["tunde.adeyemi@futminna.edu.ng"].id,
      headline: "PHY102, circuit theory & electrical engineering fundamentals",
      expertiseAreas: JSON.stringify(["PHY102", "EEE201", "EEE301"]),
      bio: "Graduate assistant, EEE. Strong on exam technique — I keep past questions on hand and we work through them session by session.",
      hourlyRate: 1800,
      availability: JSON.stringify({ mon: ["10:00-12:00"], fri: ["14:00-17:00"] }),
      status: "approved" as const,
      totalSessions: 37,
      totalEarnings: 66600,
      avgRating: 4.6,
      ratingCount: 24,
    },
  ];

  const insertedTutors = await db.insert(tutorProfiles).values(tutorData).returning();
  console.log(`  ok ${insertedTutors.length} tutor profiles`);

  // ---------- Sample bookings + ratings (for trust score / recommender seed data) ----------
  const sampleBookings = await db
    .insert(bookings)
    .values([
      {
        tutorProfileId: insertedTutors[0].id,
        studentId: byEmail["emeka.obi@futminna.edu.ng"].id,
        courseCode: "MAT201",
        scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        durationMinutes: 60,
        amount: 1500,
        status: "completed" as const,
      },
      {
        tutorProfileId: insertedTutors[1].id,
        studentId: byEmail["aisha.mohammed@futminna.edu.ng"].id,
        courseCode: "CSC301",
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
        durationMinutes: 90,
        amount: 3000,
        status: "accepted" as const,
      },
    ])
    .returning();

  await db.insert(ratings).values([
    {
      raterId: byEmail["emeka.obi@futminna.edu.ng"].id,
      targetUserId: byEmail["fatima.yusuf@futminna.edu.ng"].id,
      targetType: "tutor_session" as const,
      targetId: sampleBookings[0].id,
      score: 5,
      comment: "Explained limits so much better than my lecturer. Will book again before the exam.",
    },
  ]);

  // ---------- Sample interactions (seed the recommender so it isn't always cold-start in the demo) ----------
  const student = byEmail["emeka.obi@futminna.edu.ng"];
  await db.insert(userInteractions).values([
    { userId: student.id, targetType: "category", targetId: catBySlug["electronics"].id, interactionType: "view", weight: 1 },
    { userId: student.id, targetType: "category", targetId: catBySlug["electronics"].id, interactionType: "click", weight: 1 },
    { userId: student.id, targetType: "listing", targetId: insertedListings[1].id, interactionType: "favorite", weight: 1 },
    { userId: student.id, targetType: "search", targetId: "CSC301 tutor", interactionType: "search", weight: 1 },
    { userId: student.id, targetType: "tutor", targetId: "CSC301", interactionType: "booking", weight: 1 },
    { userId: student.id, targetType: "category", targetId: catBySlug["project-materials"].id, interactionType: "view", weight: 1 },
  ]);
  console.log("  ok sample bookings, ratings & interactions");

  // ---------- Knowledge base ----------
  const kbData = [
    {
      title: "2025/2026 Academic Calendar — Key Dates",
      category: "academic_calendar" as const,
      content:
        "First semester lectures begin the first Monday of October and run for 15 weeks, including a 2-week mid-semester break in November. First semester examinations are held in late January/early February. Second semester resumes early February and runs through June, with examinations in late June/early July. Registration (course form submission on the student portal) must be completed within the first 3 weeks of each semester to avoid a late registration fee.",
      keywords: JSON.stringify(["calendar", "semester", "exam", "registration", "dates", "resumption"]),
    },
    {
      title: "Course Registration Deadlines",
      category: "registration" as const,
      content:
        "Course registration opens immediately after school fees payment is confirmed on the portal. Students must register all courses for the semester within 3 weeks of resumption. Late registration after this window attracts a penalty fee and requires departmental approval. Carryover courses must be registered alongside current-level courses, not separately.",
      keywords: JSON.stringify(["registration", "deadline", "course form", "carryover", "portal"]),
    },
    {
      title: "Marketplace Buyer & Seller Policy",
      category: "marketplace_policy" as const,
      content:
        "All marketplace listings must be created by verified students using their FUTMINNA email. Sellers must accurately describe item condition; misrepresentation can lead to account suspension. Payments for orders above ₦5,000 are held in escrow until the buyer confirms receipt, or automatically released after 72 hours if no dispute is raised. Buyers can report a listing or a seller directly from the listing page; reports are reviewed by the moderation team within 48 hours. Prohibited items include exam materials obtained through malpractice, counterfeit goods, and any item violating university conduct rules.",
      keywords: JSON.stringify(["marketplace", "escrow", "refund", "policy", "report", "dispute", "rules"]),
    },
    {
      title: "Tutoring Module — How Booking & Payment Works",
      category: "marketplace_policy" as const,
      content:
        "To book a tutor, search by course code (e.g. MAT201) or department, view the tutor's profile, expertise areas and rating, then pick an available time slot. Payment is required to confirm a booking and is held until the session is marked complete by the student. Tutors set their own hourly rate and availability; FUTMINNA AI takes a 10% platform fee on completed sessions. Tutors must apply and be approved by an administrator before their profile becomes publicly bookable.",
      keywords: JSON.stringify(["tutoring", "booking", "tutor", "session", "payment", "fee"]),
    },
    {
      title: "IT Support & Account Help",
      category: "it_support" as const,
      content:
        "For FUTMINNA AI platform issues (login problems, payment not reflecting, listing not showing), contact platform support through the Help section in your dashboard or email support@futminna-ai.example.edu.ng. For official university IT/portal issues (school fees, result checking, change of course), contact the university ICT directorate help desk at the Senate Building or via the official student portal helpdesk link.",
      keywords: JSON.stringify(["it support", "help", "contact", "login", "support desk"]),
    },
    {
      title: "Campus Services Directory",
      category: "campus_services" as const,
      content:
        "Key campus services include: the Bursary (school fees and refund inquiries), the Health Services Department (student clinic, opens 24/7 for emergencies), the Students Affairs Division (hostel allocation, conduct matters), and departmental exam offices (transcripts, result issues). Most administrative offices are open Monday to Friday, 8am to 4pm, located around the Gidan Kwano main campus.",
      keywords: JSON.stringify(["bursary", "clinic", "health services", "hostel", "student affairs", "transcript"]),
    },
    {
      title: "Course Catalog Snapshot — Common 100-300 Level Courses",
      category: "course_catalog" as const,
      content:
        "MAT201 (Mathematical Methods I) and MAT202 (Mathematical Methods II) are core second-year courses covering calculus, linear algebra and differential equations, typically taken alongside engineering and science programmes. CSC301 (Data Structures and Algorithms) is a core 300-level Computer Science course. PHY102 (General Physics II: Electricity, Magnetism & Modern Physics) is a core first-year science/engineering course. Course outlines and credit units are published on the departmental noticeboards and the student portal at the start of each semester.",
      keywords: JSON.stringify(["MAT201", "MAT202", "CSC301", "PHY102", "course catalog", "credit unit"]),
    },
    {
      title: "Trust Score — How It's Calculated",
      category: "general" as const,
      content:
        "Every user has a trust score from 0 to 100, shown on their profile. It's built from five factors: verification status (FUTMINNA email + ID verification), number of successfully completed transactions, average rating from other users, responsiveness in chats, and any dispute history (which lowers the score). A higher trust score signals a more reliable buyer, seller, or tutor and is one of the signals used in search ranking.",
      keywords: JSON.stringify(["trust score", "verification", "rating", "reliability"]),
    },
    {
      title: "AI Recommendations — How They Work",
      category: "general" as const,
      content:
        "FUTMINNA AI recommends listings and tutors using a hybrid model: 60% based on what similar students have engaged with (collaborative filtering), and 40% based on your own browsing, search and booking history matched to categories and course codes (content-based filtering). New accounts with little activity instead see trending listings and popular tutors until there's enough history to personalize. Recommendations refresh roughly every 24 hours, and each one shows a short reason explaining why it was suggested.",
      keywords: JSON.stringify(["recommendation", "AI", "personalization", "collaborative filtering", "trending"]),
    },
  ];

  await db.insert(knowledgeBaseDocuments).values(kbData);
  console.log(`  ok ${kbData.length} knowledge base documents`);

  console.log("\nSeed complete.");
  console.log("Demo logins (password: Password123!):");
  console.log("  admin@futminna.edu.ng   (admin)");
  console.log("  hauwa.bello@futminna.edu.ng (student)");
  console.log("  emeka.obi@futminna.edu.ng   (student)");
  console.log("  fatima.yusuf@futminna.edu.ng (tutor)");
  console.log("  chidi.okafor@futminna.edu.ng (tutor)");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
