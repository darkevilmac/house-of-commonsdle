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
    queue: [] as Member[],
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
      this.queue = []
      this.fillQueue()
      this.nextRound()
    },
    preloadImage(url: string) {
      const img = new Image()
      img.src = url
    },
    fillQueue() {
      const targetQueueSize = 5
      while (this.queue.length < targetQueueSize) {
        // Filter out members that are already in history OR in the queue
        const usedIds = new Set([...this.history.map((m) => m.id), ...this.queue.map((m) => m.id)])
        const available = this.members.filter((m) => !usedIds.has(m.id))

        if (available.length === 0) break

        const randomIndex = Math.floor(Math.random() * available.length)
        const member = available[randomIndex]
        if (!member) continue

        this.queue.push(member)
        this.preloadImage(member.imagePath)
      }
    },
    nextRound() {
      if (this.queue.length === 0 && this.history.length === this.members.length) {
         this.isGameOver = true
         this.currentMember = null
         return
      }

      // If queue is empty but strictly speaking there are members left (edge case), try to fill it
      if (this.queue.length === 0) {
          this.fillQueue()
          if (this.queue.length === 0) {
            this.isGameOver = true
            this.currentMember = null
            return
          }
      }

      const nextMember = this.queue.shift()
      if (nextMember) {
        this.currentMember = nextMember
        this.history.push(this.currentMember)
      } else {
        // Should not happen if logic is correct
        this.currentMember = null
      }
      
      this.isCorrect = null
      this.lastGuess = null
      
      this.fillQueue()
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
