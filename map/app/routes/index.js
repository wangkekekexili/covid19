import Route from '@ember/routing/route';
import {isNone} from '@ember/utils';

export default class IndexRoute extends Route {
  async model() {
    const response = await fetch('https://ke-covid19-api.now.sh/api/all');
    const j = await response.json();
    return j.data.filter(e => e.city === '上海市' && !isNone(e.latitude));
  }
}

