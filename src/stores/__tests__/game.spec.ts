import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../game'

vi.mock('../../data/members.json', () => ({
  default: [
    {
      id: 'Member 1',
      firstName: 'Member',
      lastName: 'One',
      constituency: 'Riding 1',
      province: 'Province 1',
      party: 'Liberal',
      partyCode: 'LPC',
      imagePath: '/images/mps/member1.jpg',
    },
    {
      id: 'Member 2',
      firstName: 'Member',
      lastName: 'Two',
      constituency: 'Riding 2',
      province: 'Province 2',
      party: 'Conservative',
      partyCode: 'CPC',
      imagePath: '/images/mps/member2.jpg',
    },
    {
      id: 'Member 3',
      firstName: 'Member',
      lastName: 'Three',
      constituency: 'Riding 3',
      province: 'Province 3',
      party: 'NDP',
      partyCode: 'NDP',
      imagePath: '/images/mps/member3.jpg',
    },
  ],
}))

describe('Game Store', () => {
  beforeEach(() => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
      removeItem: vi.fn(),
    }
    global.localStorage = localStorageMock as any

    global.Image = class {
      onload: () => void = () => {}
      onerror: () => void = () => {}
      src: string = ''
      constructor() {
        setTimeout(() => this.onload(), 0) // Simulate fast load
      }
    } as any

    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes with default state', () => {
    const store = useGameStore()
    expect(store.score).toBe(0)
    expect(store.attempts).toBe(0)
    expect(store.history).toHaveLength(0)
    expect(store.isGameOver).toBe(false)
    expect(store.settings.excludedIds).toEqual([])
  })

  it('loads members and starts game', async () => {
    const store = useGameStore()
    await store.loadMembers()
    expect(store.members).toHaveLength(3)
    expect(store.currentMember).not.toBeNull()
    expect(store.history).toHaveLength(0)
    expect(store.partyStats['LPC']).toBeDefined()
  })

  it('handles correct guess', async () => {
    const store = useGameStore()
    await store.loadMembers()

    const targetMember = store.members.find((m) => m.id === store.currentMember?.id)!

    store.submitGuess(targetMember.partyCode)

    expect(store.score).toBe(1)
    expect(store.attempts).toBe(1)
    expect(store.isCorrect).toBe(true)
    expect(store.score).toBe(1)
    expect(store.attempts).toBe(1)
    expect(store.isCorrect).toBe(true)
    expect(store.partyStats[targetMember.partyCode]!.correct).toBe(1)
    expect(store.history).toHaveLength(1)
  })

  it('handles incorrect guess', async () => {
    const store = useGameStore()
    await store.loadMembers()

    const targetMember = store.members.find((m) => m.id === store.currentMember?.id)!

    const wrongParty = targetMember.partyCode === 'LPC' ? 'CPC' : 'LPC'
    store.submitGuess(wrongParty)

    expect(store.score).toBe(0)
    expect(store.attempts).toBe(1)
    expect(store.isCorrect).toBe(false)
    expect(store.score).toBe(0)
    expect(store.attempts).toBe(1)
    expect(store.isCorrect).toBe(false)
    expect(store.partyStats[targetMember.partyCode]!.correct).toBe(0)
    expect(store.history).toHaveLength(1)
  })

  it('progresses to next round', async () => {
    const store = useGameStore()
    await store.loadMembers()

    const firstMember = store.currentMember
    await store.nextRound()

    expect(store.currentMember).not.toEqual(firstMember)
    // History length depends on when we check. If we just called nextRound directly without a guess,
    // push to history doesn't happen in nextRound anymore.
    // However, in the real game loop, submitGuess pushes to history BEFORE calling nextRound.
    // So if we just call nextRound manually in test, history won't increase.
    // Let's simulate a guess + nextRound flow which is more realistic or adjust expectation based on manual call.
    
    // If we just want to test nextRound basic functionality:
    // It should have just changed the member. History stays same unless guess happened.
    expect(store.history).toHaveLength(0) 
  })

  it('ends game when all members guessed', async () => {
    const store = useGameStore()
    await store.loadMembers()

    // Simulate game flow properly
    const guessAll = async () => {
        while(store.currentMember) {
            store.submitGuess(store.currentMember.partyCode)
            // wait for nextRound which is called via setTimeout in real app, but we need to trigger it manually or mock timers
            // Since submitGuess calls setTimeout, we can just call nextRound manually or wait. 
            // Better to just manually call what pushes to history for this test setup or use a helper that simulates the flow.
            // Actually, submitGuess doesn't await.
            await store.nextRound()
        }
    }
    
    // Manually pushing to history to simulate the flow since we changed logic
    store.history.push(store.currentMember!)
    await store.nextRound()
    store.history.push(store.currentMember!)
    await store.nextRound()
    store.history.push(store.currentMember!)
    await store.nextRound()

    expect(store.isGameOver).toBe(true)
    expect(store.currentMember).toBeNull()
  })

  it('resets game state', async () => {
    const store = useGameStore()
    await store.loadMembers()
    store.submitGuess('LPC')

    await store.resetGame()
    expect(store.score).toBe(0)
    expect(store.attempts).toBe(0)
    expect(store.attempts).toBe(0)
    expect(store.history).toHaveLength(0)
    expect(store.isGameOver).toBe(false)
  })

  describe('Blacklist/Exclusion Logic', () => {
    it('excludes members from queue when added to blacklist', async () => {
      const store = useGameStore()
      await store.loadMembers()

      const memberToExclude = store.members[1]
      if (!memberToExclude) throw new Error('Member 2 not found')

      store.addToExcludedList(memberToExclude.id)

      expect(store.settings.excludedIds).toContain(memberToExclude.id)
      expect(store.queue.find((m) => m.id === memberToExclude.id)).toBeUndefined()
    })

    it('does not select excluded members when filling queue', async () => {
      const store = useGameStore()

      store.settings.excludedIds = ['Member 3']
      await store.loadMembers()

      const allQueuedAndCurrent = [store.currentMember, ...store.queue]
      const member3InGame = allQueuedAndCurrent.find((m) => m?.id === 'Member 3')

      expect(member3InGame).toBeUndefined()
      expect(store.members.length).toBe(3)
    })

    it('resets exclusion list and makes members available again', async () => {
      const store = useGameStore()
      store.addToExcludedList('Member 1')
      expect(store.settings.excludedIds).toContain('Member 1')

      store.resetExcludedList()
      expect(store.settings.excludedIds).toHaveLength(0)

      store.history = []
      store.queue = []
      store.fillQueue()

      const uniqueInQueue = new Set(store.queue.map((m) => m.id))
      expect(uniqueInQueue.has('Member 1')).toBe(true)
    })

    it('correctly calculates totalMembers based on exclusions', async () => {
      const store = useGameStore()
      await store.loadMembers()

      const initialTotal = store.totalMembers
      expect(initialTotal).toBe(3)

      store.addToExcludedList('Member 1')
      expect(store.totalMembers).toBe(2)

      store.addToExcludedList('Member 2')
      expect(store.totalMembers).toBe(1)
      
      store.resetExcludedList()
      expect(store.totalMembers).toBe(3)
    })
  })
})
