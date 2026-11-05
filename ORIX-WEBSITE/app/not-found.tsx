import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeContent: "center",
        gap: "1rem",
        padding: "2rem",
        background: "#111318",
        color: "#f4f5f7",
        textAlign: "center",
      }}
    >
      <h1>Page not found</h1>
      <p>That ORIX page is not here.</p>
      <Link href="/" style={{ color: "#a4c8ff", textDecoration: "underline" }}>
        Return to ORIX
      </Link>
    </main>
  );
}
