import type { Member } from '../types/member'

export function isLeader(member: Member): boolean {
  return (
    (member.firstName === 'Pierre' &&
      member.lastName === 'Poilievre' &&
      member.constituency === 'Battle River—Crowfoot') ||
    (member.firstName === 'Mark' &&
      member.lastName === 'Carney' &&
      member.constituency === 'Nepean') ||
    (member.firstName === 'Don' &&
      member.lastName === 'Davies' &&
      member.constituency === 'Vancouver Kingsway') ||
    (member.firstName === 'Yves-François' &&
      member.lastName === 'Blanchet' &&
      member.constituency === 'Beloeil—Chambly') ||
    (member.firstName === 'Elizabeth' &&
      member.lastName === 'May' &&
      member.constituency === 'Saanich—Gulf Islands')
  )
}

export function evaluateGuess(guess: string, target: string, americanMode: boolean): boolean {
  if (americanMode) {
    const conservativeGroup = ['CPC']
    if (guess === 'CPC') {
      return conservativeGroup.includes(target)
    } else {
      return !conservativeGroup.includes(target)
    }
  }
  return target === guess
}

export function getFeedbackMessage(isCorrect: boolean, isLeaderMember: boolean): string | null {
  if (!isLeaderMember) return null
  return isCorrect ? 'Well, yeah.' : '...Really?'
}
