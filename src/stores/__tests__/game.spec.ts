import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../game'

// Mock the members data
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
  ],
}))

describe('Game Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default state', () => {
    const store = useGameStore()
    expect(store.score).toBe(0)
    expect(store.attempts).toBe(0)
    expect(store.history).toHaveLength(0)
    expect(store.isGameOver).toBe(false)
  })

  it('loads members and starts game', () => {
    const store = useGameStore()
    store.loadMembers()
    expect(store.members).toHaveLength(2)
    expect(store.currentMember).not.toBeNull()
    expect(store.history).toHaveLength(1)
    expect(store.partyStats['LPC']).toBeDefined()
  })

  it('handles correct guess', () => {
    const store = useGameStore()
    store.loadMembers()
    
    // Force specific member for testing
    const targetMember = store.members[0]
    store.currentMember = targetMember
    
    store.submitGuess(targetMember.partyCode)
    
    expect(store.score).toBe(1)
    expect(store.attempts).toBe(1)
    expect(store.isCorrect).toBe(true)
    expect(store.partyStats[targetMember.partyCode].correct).toBe(1)
  })

  it('handles incorrect guess', () => {
    const store = useGameStore()
    store.loadMembers()
    
    const targetMember = store.members[0]
    store.currentMember = targetMember
    
    // Guess wrong party
    const wrongParty = targetMember.partyCode === 'LPC' ? 'CPC' : 'LPC'
    store.submitGuess(wrongParty)
    
    expect(store.score).toBe(0)
    expect(store.attempts).toBe(1)
    expect(store.isCorrect).toBe(false)
    expect(store.partyStats[targetMember.partyCode].correct).toBe(0)
  })

  it('progresses to next round', () => {
    const store = useGameStore()
    store.loadMembers()
    
    const firstMember = store.currentMember
    store.nextRound()
    
    expect(store.currentMember).not.toEqual(firstMember)
    expect(store.history).toHaveLength(2)
  })

  it('ends game when all members guessed', () => {
    const store = useGameStore()
    store.loadMembers()
    
    // Play through all members (2 in mock)
    store.nextRound() // 2nd member
    store.nextRound() // Should trigger game over
    
    expect(store.isGameOver).toBe(true)
    expect(store.currentMember).toBeNull()
  })

  it('resets game state', () => {
    const store = useGameStore()
    store.loadMembers()
    store.submitGuess('LPC')
    
    store.resetGame()
    
    expect(store.score).toBe(0)
    expect(store.attempts).toBe(0)
    expect(store.history).toHaveLength(1) // resetGame calls loadMembers which starts first round
    expect(store.isGameOver).toBe(false)
  })
})
