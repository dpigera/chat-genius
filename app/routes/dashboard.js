import Route from '@ember/routing/route';

export default class DashboardRoute extends Route {
  async model() {
    const [channels, directMessages] = await Promise.all([
      fetch('/api/channels').then(r => r.json()),
      fetch('/api/directmsgs').then(r => r.json())
    ]);

    return {
      channels: channels.channels,
      directMessages: directMessages.users
    };
  }
}