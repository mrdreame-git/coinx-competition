import CompetitionCard from "@/features/competitions/components/CompetitionCard"
import { COMPETITIONS } from "@/mocks/competitions"

export default function CompetitionsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#080D18" }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-black text-3xl mb-8" style={{ color: "#FFFFFF" }}>
          COMPETITIONS
        </h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {COMPETITIONS.map((c) => (
            <CompetitionCard key={c.id} comp={c} />
          ))}
        </div>
      </div>
    </div>
  )
}
