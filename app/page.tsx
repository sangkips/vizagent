import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Homepage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
          Innovate Faster with
          <br />
          VizAgent
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Empowering businesses with cutting-edge solutions. From generating AI-driven analytics to powerful and seamless 
          visualization tools, we{'\''}re shaping the future of technology.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
           <Link href="/documents">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 text-base font-medium">
              Explore Solutions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            className="border-slate-600 text-white hover:bg-slate-800 px-8 py-3 text-base font-medium"
          >
            Schedule a Demo
          </Button>
        </div>
      </div>
    </div>
  )
}
