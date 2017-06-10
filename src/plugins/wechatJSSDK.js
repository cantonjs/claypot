
import weixinJSSDK from 'koa-weixin-jssdk';
import Ask from 'http-ask';
import { getCache } from '../dbs/cache';

const WX_TICKET_CACHE_KEY = 'wx_js_ticket';

export default class WechatJSSDK {
	constructor(options) {
		this._options = options;
	}

	middleware(app) {
		const cache = getCache();
		const { path, appId, appSecret, ticketURL, fetchToken } = this._options;
		const config = {
			appId,
			secret: appSecret,
			pathName: path,
		};

		if (fetchToken) {
			config.fetchTicket = async () => {
				const ticketResp = await cache.get(WX_TICKET_CACHE_KEY);
				if (ticketResp) {
					return ticketResp;
				}
				const json = await Ask.request(
					`${ticketURL}?access_token=${fetchToken}`
				);
				await cache.set(WX_TICKET_CACHE_KEY, json, json.expires_in / 1000);
				return json;
			};
		}

		app.use(weixinJSSDK(config));
	}
}
