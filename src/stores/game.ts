import { defineStore } from 'pinia'
import membersData from '../data/members.json'
import type { Member } from '../types/member'
import { preloadImage } from '../utils/imageLoader'
import { isLeader, evaluateGuess, getFeedbackMessage } from '../utils/gameLogic'

export const useGameStore = defineStore('game', {
  state: () => ({
    members: membersData as Member[],
    currentMember: null as Member | null,
    imageReady: false, // New: tracks if current member's image is loaded
    score: 0,
    attempts: 0,
    isCorrect: null as boolean | null, // null = waiting, true = correct, false = wrong
    lastGuess: null as string | null,
    history: [] as Member[],
    queue: [] as Member[],
    partyStats: {} as Record<string, { attempts: number; correct: number }>,
    isGameOver: false,
    feedbackMessage: null as string | null,
    settings: {
      americanMode: false,
      easyMode: false,
      excludedIds: [] as string[],
    },
  }),
  actions: {
    async loadMembers() {
      const storedSettings = localStorage.getItem('gameSettings')
      if (storedSettings) {
        try {
          const parsed = JSON.parse(storedSettings)
          this.settings = {
            ...this.settings,
            ...parsed,
            // Ensure array exists if loading from old settings
            excludedIds: Array.isArray(parsed.excludedIds)
              ? parsed.excludedIds
              : this.settings.excludedIds,
          }
        } catch (e) {
          console.error('Failed to load settings', e)
        }
      }

      if (Object.keys(this.partyStats).length === 0) {
        ;['LPC', 'CPC', 'NDP', 'BQ', 'GPC'].forEach((code) => {
          this.partyStats[code] = { attempts: 0, correct: 0 }
        })
      }
      this.queue = []
      await this.fillQueue()
      await this.nextRound()
    },
    updateSettings(
      newSettings: Partial<{ americanMode: boolean; easyMode: boolean; excludedIds: string[] }>,
    ) {
      this.settings = { ...this.settings, ...newSettings }
      localStorage.setItem('gameSettings', JSON.stringify(this.settings))
    },
    addToExcludedList(memberId: string) {
      if (!this.settings.excludedIds.includes(memberId)) {
        const newExcluded = [...this.settings.excludedIds, memberId]
        this.updateSettings({ excludedIds: newExcluded })

        this.queue = this.queue.filter((m) => m.id !== memberId)
        this.fillQueue()
      }
    },
    resetExcludedList() {
      this.updateSettings({ excludedIds: [] })
      this.fillQueue()
    },
    async fillQueue(targetQueueSize = 5) {
      const preloadPromises: Promise<void>[] = []

      while (this.queue.length < targetQueueSize) {
        // Filter out members that are already in history OR in the queue OR excluded OR current member
        const usedIds = new Set([
          ...this.history.map((m) => m.id),
          ...this.queue.map((m) => m.id),
          ...this.settings.excludedIds,
        ])
        if (this.currentMember) {
          usedIds.add(this.currentMember.id)
        }

        const available = this.members.filter((m) => !usedIds.has(m.id))

        if (available.length === 0) break

        const randomIndex = Math.floor(Math.random() * available.length)
        const member = available[randomIndex]
        if (!member) continue

        this.queue.push(member)
        // Start preloading but don't await - collect promises
        preloadPromises.push(preloadImage(member.imagePath))
      }

      // Wait for first image (next in queue) to be ready, others load in background
      if (preloadPromises.length > 0) {
        await preloadPromises[0]
      }
    },
    async nextRound() {
      if (this.queue.length === 0 && this.history.length === this.members.length) {
        this.isGameOver = true
        this.currentMember = null
        this.imageReady = false
        return
      }

      // Signal that we're transitioning - image not ready yet
      this.imageReady = false

      // If queue is empty but strictly speaking there are members left (edge case), try to fill it
      if (this.queue.length === 0) {
        await this.fillQueue()
        if (this.queue.length === 0) {
          this.isGameOver = true
          this.currentMember = null
          return
        }
      }

      const nextMember = this.queue.shift()

      if (nextMember) {
        // Await the image before displaying - it should already be cached from fillQueue
        // but we ensure it's ready here
        await preloadImage(nextMember.imagePath)

        this.isCorrect = null
        this.lastGuess = null
        this.feedbackMessage = null

        this.currentMember = nextMember
        this.imageReady = true // Image confirmed loaded, safe to display
        this.history.push(this.currentMember)
      } else {
        // Should not happen if logic is correct
        this.currentMember = null
      }

      // Fill queue in background (don't await - fire and forget for next members)
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

      // IMMEDIATE FETCH: Fill queue to 6 to start preloading the next member immediately
      this.fillQueue(6)

      const isLeaderMember = isLeader(this.currentMember)
      const isGuessCorrect = evaluateGuess(partyCode, targetParty, this.settings.americanMode)

      this.isCorrect = isGuessCorrect
      this.feedbackMessage = getFeedbackMessage(isGuessCorrect, isLeaderMember)

      if (isGuessCorrect) {
        this.score++
        this.partyStats[targetParty].correct++
      }

      setTimeout(() => {
        this.nextRound()
      }, 1500)
    },
    async resetGame() {
      this.score = 0
      this.attempts = 0
      this.history = []
      this.partyStats = {}
      this.isGameOver = false
      await this.loadMembers()
    },
  },
})

if (import.meta.env.DEV) {
  ;(window as any).endGame = () => {
    const store = useGameStore()
    store.history = [...store.members]
    store.isGameOver = true
    store.currentMember = null
  }
}
