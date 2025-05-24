export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">VizChat App</h1>
      <p>Welcome to the document chat application.</p>
    </div>
  );
}

// "use client"

// import { useRouter } from "next/navigation"
// import { useEffect } from "react"

// export default function Page() {
//   const router = useRouter()

//   useEffect(() => {
//     router.push("/login")
//   }, [router])

//   return null
// }
