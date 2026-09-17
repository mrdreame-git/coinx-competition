import type { Competition } from "@/types/competition"
import { COMPETITIONS } from "@/mocks/competitions"

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

async function getCompetitions(): Promise<Competition[]> {
  await delay()
  return COMPETITIONS
}

async function getCompetitionById(
  id: number | string,
): Promise<Competition | undefined> {
  await delay(150)
  const numericId = Number(id)
  return COMPETITIONS.find((c) => c.id === numericId)
}

async function joinCompetition(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  await delay(600)
  const numericId = Number(id)
  const competition = COMPETITIONS.find((c) => c.id === numericId)
  if (!competition) {
    return { success: false, message: "Competition not found" }
  }
  return { success: true, message: "You're registered!" }
}

export const competitionService = {
  getCompetitions,
  getCompetitionById,
  joinCompetition,
}
