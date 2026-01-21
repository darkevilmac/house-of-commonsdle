import { defineStore } from 'pinia'
import membersData from '../data/members.json'

interface Member {
  id: string
  firstName: string
  lastName: string
  constituency: string
  province: string
  party: string
  partyCode: string
  imagePath: string
}

export const useGameStore = defineStore('game', {
  state: () => ({
    members: membersData as Member[],
    currentMember: null as Member | null,
    score: 0,
    attempts: 0,
    isCorrect: null as boolean | null, // null = waiting, true = correct, false = wrong
    lastGuess: null as string | null,
    history: [] as Member[],
    partyStats: {} as Record<string, { attempts: number; correct: number }>,
    isGameOver: false,
  }),
  actions: {
    loadMembers() {
      if (Object.keys(this.partyStats).length === 0) {
        ;['LPC', 'CPC', 'NDP', 'BQ', 'GPC'].forEach((code) => {
          this.partyStats[code] = { attempts: 0, correct: 0 }
        })
      }
      this.nextRound()
    },
    nextRound() {
      // Filter out members that are already in history (already played)
      const usedIds = new Set(this.history.map((m) => m.id))
      const available = this.members.filter((m) => !usedIds.has(m.id))

      if (available.length === 0) {
        this.isGameOver = true
        this.currentMember = null
        return
      }

      const randomIndex = Math.floor(Math.random() * available.length)
      this.currentMember = available[randomIndex] || null
      if (this.currentMember) {
        this.history.push(this.currentMember)
      }

      this.isCorrect = null
      this.lastGuess = null
    },
    submitGuess(partyCode: string) {
      if (!this.currentMember) return

      this.lastGuess = partyCode
      this.attempts++

      const targetParty = this.currentMember.partyCode

      // Initialize if not exists (e.g. for Independent or minor parties if they appear)
      if (!this.partyStats[targetParty]) {
        this.partyStats[targetParty] = { attempts: 0, correct: 0 }
      }

      this.partyStats[targetParty].attempts++

      if (targetParty === partyCode) {
        this.score++
        this.isCorrect = true
        this.partyStats[targetParty].correct++
      } else {
        this.isCorrect = false
      }

      // Delay next round if we want to show result
      setTimeout(() => {
        this.nextRound()
      }, 1500)
    },
    resetGame() {
      this.score = 0
      this.attempts = 0
      this.history = []
      this.partyStats = {}
      this.isGameOver = false
      this.loadMembers()
    },
  },
})

if (import.meta.env.DEV) {
  (window as any).endGame = () => {
    const store = useGameStore()
    store.history = [...store.members]
    store.isGameOver = true
    store.currentMember = null
  }
}
