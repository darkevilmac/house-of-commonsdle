import { fetchMembers } from '../scripts/fetch-members';

export default function dataFetchPlugin() {
  return {
    name: 'data-fetch-plugin',
    async buildStart() {
      console.log('Running data fetch script...');
      await fetchMembers();
    }
  }
}
